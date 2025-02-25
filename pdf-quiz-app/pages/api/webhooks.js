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
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customerId = session.customer;
    const userId = session.metadata.userId;
    const priceId = subscription.items.data[0].price.id;

    // Find the plan type from price ID
    const planType = Object.entries(PLANS).find(
      ([_, plan]) => plan.stripePriceId === priceId
    )?.[0];

    if (!planType) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Update or create subscription in Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_type: planType,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const priceId = subscription.items.data[0].price.id;
    
    // Find the plan type from price ID
    const planType = Object.entries(PLANS).find(
      ([_, plan]) => plan.stripePriceId === priceId
    )?.[0];

    if (!planType) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Get the user_id from metadata or customer
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.supabase_user_id;

    // Start a transaction to update both tables
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: planType,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (subscriptionError) throw subscriptionError;

    // Update the profile tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        tier: planType.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

  } catch (error) {
    console.error('Error handling subscription update:', error);
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
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
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