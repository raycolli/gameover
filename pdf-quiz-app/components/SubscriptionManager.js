import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, getStripe } from '../config/stripe';

export default function SubscriptionManager() {
  const { user, supabase } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      setCancelLoading(true);
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      await loadSubscription();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdateSubscription = async (newPlanId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: newPlanId,
          userId: user.id,
          isUpgrade: true,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading subscription details...</div>;
  }

  const currentPlan = PLANS[subscription?.plan_type || 'FREE'];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Subscription Status</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-300">Current Plan</p>
            <p className="text-xl font-semibold text-white">{currentPlan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-300">Price</p>
            <p className="text-xl font-semibold text-white">
              ${(currentPlan.price / 100).toFixed(2)}/month
            </p>
          </div>
        </div>

        {subscription?.current_period_end && (
          <div className="text-gray-300">
            Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
          </div>
        )}

        <div className="text-gray-300">
          Quizzes used: {subscription?.quiz_count || 0} / 
          {currentPlan.quizLimit === -1 ? '∞' : currentPlan.quizLimit}
        </div>

        {subscription?.plan_type !== 'FREE' && (
          <div className="flex space-x-4">
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {subscription?.plan_type !== 'PRO' && (
          <button
            onClick={() => handleUpdateSubscription('PRO')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
} 