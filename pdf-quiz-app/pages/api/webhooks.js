import { buffer } from 'micro';
import stripe from '../../lib/stripe';
import { supabase } from '../../utils/supabaseClient';
import { PLANS } from '../../config/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handleCheckoutSession(session) {
  try {
    // Retrieve the subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customerId = session.customer;
    const userId = session.client_reference_id; // This comes from the checkout URL parameter we added
    const priceId = subscription.items.data[0].price.id;

    // Find the plan type from price ID
    const planType = Object.entries(PLANS).find(
      ([_, plan]) => plan.stripePriceId === priceId
    )?.[0];

    if (!planType) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Start a transaction to update both tables
    const updates = await Promise.all([
      // Update or create subscription record
      supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
          quiz_count: 0, // Initialize quiz count
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        }),

      // Update profile tier
      supabase
        .from('profiles')
        .update({
          tier: planType.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    ]);

    // Check for errors
    const errors = updates.filter(update => update.error);
    if (errors.length > 0) {
      console.error('Database update errors:', errors);
      throw new Error('Failed to update subscription status');
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Get the user_id from the customer metadata
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.client_reference_id;

    // Start a transaction to update both tables
    const updates = await Promise.all([
      // Update subscription status
      supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id),

      // Update profile tier to free
      supabase
        .from('profiles')
        .update({
          tier: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    ]);

    // Check for errors
    const errors = updates.filter(update => update.error);
    if (errors.length > 0) {
      console.error('Database update errors:', errors);
      throw new Error('Failed to update subscription status');
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSession(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: error.message });
  }
} 