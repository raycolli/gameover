import { PLANS } from '../../config/stripe';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { planId, userId, userEmail } = req.body;
    console.log('Request received:', { planId, userId, userEmail });

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
    if (!plan || !plan.stripeLink) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Instead of creating a checkout session, we'll return the hosted checkout link
    // The front-end will handle the redirect
    let checkoutUrl = plan.stripeLink;
    
    // Append email parameter if provided
    if (userEmail) {
      checkoutUrl += `?prefilled_email=${encodeURIComponent(userEmail)}`;
    }
    
    // Optionally add customer metadata via URL parameters
    checkoutUrl += `${userEmail ? '&' : '?'}client_reference_id=${userId}`;

    console.log('Redirecting to checkout URL:', checkoutUrl);
    res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      message: 'Error processing checkout request',
      error: error.message,
      stack: error.stack
    });
  }
} 