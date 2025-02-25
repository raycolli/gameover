import stripe from '../../lib/stripe';
import { PLANS } from '../../config/stripe';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { planId, userId } = req.body;
    console.log('Request received:', { planId, userId });

    // Check current subscription status
    const { data: currentSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return res.status(400).json({ message: 'Error fetching current subscription' });
    }

    console.log('Current subscription:', currentSubscription);

    // If user has an active subscription, handle accordingly
    if (currentSubscription?.status === 'active' && currentSubscription?.plan_type === 'PRO') {
      return res.status(400).json({ message: 'Already subscribed to PRO plan' });
    }

    const plan = PLANS[planId];
    if (!plan || !plan.stripePriceId) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return res.status(400).json({ message: 'Profile not found' });
    }

    let customerId = currentSubscription?.stripe_customer_id;

    if (!customerId) {
      console.log('Creating new Stripe customer');
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Update subscription with customer ID
      await supabase
        .from('subscriptions')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    console.log('Creating checkout session for customer:', customerId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId,
        planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Session created:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      message: 'Error creating checkout session',
      error: error.message,
      stack: error.stack
    });
  }
} 