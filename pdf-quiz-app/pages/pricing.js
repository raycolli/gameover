import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
  const router = useRouter();
  const { user, supabase } = useAuth();

  const handleProSubscription = async () => {
    if (!user) {
      // If user is not logged in, redirect to signup
      localStorage.setItem('selectedPlan', 'pro');
      router.push('/signup');
      return;
    }

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error starting checkout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Upgrade to Pro
        </h2>
        <p className="mt-3 text-xl text-gray-300 sm:mt-4">
          Unlock the full potential of Note Nibblers
        </p>

        {/* Pro Plan Card */}
        <div className="mt-12 bg-blue-900 rounded-lg shadow-xl p-8 border-2 border-blue-400">
          <div className="flex items-center justify-center space-x-2">
            <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
            <span className="px-3 py-1 text-sm text-blue-200 bg-blue-800 rounded-full">
              Most Popular
            </span>
          </div>
          
          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-5xl font-extrabold text-white">$19.99</span>
            <span className="ml-1 text-2xl text-blue-200">/month</span>
          </div>

          <ul className="mt-8 space-y-4 text-left">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-3 text-blue-200">Unlimited PDFs</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-3 text-blue-200">Advanced AI quiz generation</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-3 text-blue-200">Priority support</span>
            </li>
          </ul>

          <button
            onClick={handleProSubscription}
            className="mt-8 w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors text-lg font-semibold"
          >
            Get Started with Pro
          </button>
          
          <p className="mt-4 text-sm text-blue-200">
            Secure payment with Stripe • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
} 