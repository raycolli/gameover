import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parsing, need the raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }

    const data = event.data;
    const eventType = event.type;

    try {
      switch (eventType) {
        case 'checkout.session.completed': {
          // Retrieve the session with line items
          const session = await stripe.checkout.sessions.retrieve(
            data.object.id,
            {
              expand: ['line_items']
            }
          );
          
          const customerId = session?.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const priceId = session?.line_items?.data[0]?.price.id;

          if (customer.email) {
            // Find user in Supabase by email
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', customer.email)
              .single();

            if (userError) {
              console.error('Error finding user:', userError);
              throw userError;
            }

            // Update subscription information
            const { error: subscriptionError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userData.id,
                stripe_customer_id: customerId,
                stripe_subscription_id: session.subscription,
                price_id: priceId,
                status: 'active',
                current_period_end: new Date(
                  session.subscription_data?.trial_end || 
                  Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
                ),
              });

            if (subscriptionError) {
              console.error('Error updating subscription:', subscriptionError);
              throw subscriptionError;
            }

            console.log('Successfully processed subscription for:', customer.email);
          } else {
            console.error('No email found in customer data');
            throw new Error('No email found in customer data');
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = data.object;
          const customer = await stripe.customers.retrieve(subscription.customer);

          // Find user by email
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', customer.email)
            .single();

          if (userError) {
            console.error('Error finding user:', userError);
            throw userError;
          }

          // Update subscription status
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({ status: 'inactive' })
            .eq('user_id', userData.id);

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            throw subscriptionError;
          }

          console.log('Successfully cancelled subscription for:', customer.email);
          break;
        }

        default:
          console.log('Unhandled event type:', eventType);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(500).json({ error: 'Webhook handler failed' });
    }
  } catch (err) {
    console.error('Fatal webhook error:', err);
    return res.status(500).json({ error: 'Fatal webhook error' });
  }
} 