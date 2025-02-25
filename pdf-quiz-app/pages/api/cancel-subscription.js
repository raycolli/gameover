import stripe from '../../lib/stripe';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subscriptionId, userId } = req.body;

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update both subscriptions and profiles tables
    const updates = await Promise.all([
      // Update subscription status
      supabase
        .from('subscriptions')
        .update({
          status: 'canceling',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId),

      // Update profile tier (will revert to free at end of period)
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
      throw new Error('Failed to update subscription status');
    }

    res.status(200).json({ 
      message: 'Subscription cancelled successfully',
      effectiveDate: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
} 