import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, getStripe } from '../config/stripe';
import { useRouter } from 'next/router';

export default function Pricing() {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();

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
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned from the server');
      }

      console.log('Session ID received:', data.sessionId); // Debug log

      const stripe = await getStripe();
      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      alert('No active subscription found');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      alert(`Subscription will be cancelled at the end of the billing period: ${new Date(data.effectiveDate).toLocaleDateString()}`);
      await loadSubscription(); // Reload subscription data
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {subscription && (
          <div className="mb-12 bg-gray-800 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Current Subscription</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Plan</p>
                <p className="text-lg font-semibold">{PLANS[subscription.plan_type].name}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="text-lg font-semibold capitalize">{subscription.status}</p>
              </div>
              {subscription.plan_type === 'FREE' && (
                <div>
                  <p className="text-gray-400">Quizzes Used</p>
                  <p className="text-lg font-semibold">
                    {subscription.quiz_count} / {PLANS.FREE.quizLimit}
                  </p>
                </div>
              )}
              {subscription.current_period_end && (
                <div>
                  <p className="text-gray-400">Next Billing Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
              {subscription.plan_type === 'PRO' && subscription.status === 'active' && (
                <div className="col-span-2 mt-4">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                             rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    Your subscription will remain active until the end of the current billing period
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-blue-400 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Start with our free plan or upgrade for unlimited access
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          {Object.entries(PLANS).map(([planId, plan]) => (
            <div
              key={planId}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-4 text-5xl font-extrabold text-white">
                  ${(plan.price / 100).toFixed(2)}
                  {plan.price > 0 && <span className="text-xl font-medium text-gray-400">/month</span>}
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex text-gray-300">
                      <span className="text-blue-400 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(planId)}
                    disabled={loading || (subscription?.plan_type === planId && subscription?.status === 'active')}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white
                      ${subscription?.plan_type === planId && subscription?.status === 'active'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading 
                      ? 'Processing...' 
                      : subscription?.plan_type === planId && subscription?.status === 'active'
                      ? 'Current Plan'
                      : !user
                      ? 'Sign up to Subscribe'
                      : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 