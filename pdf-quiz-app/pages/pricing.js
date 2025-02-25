import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Pricing() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [supabase.auth, router]);

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please log in to subscribe');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1Qw7W44SgsSTJ8c9nn6Jtpj2', // Your Stripe price ID
          userId: user.id,
        }),
      });

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl; // Redirect to Stripe Checkout
    } catch (err) {
      setError('Failed to start subscription process. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-400">
          Subscribe to Note Nibblers
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Get full access to all features
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-900 border border-red-600 text-red-300 p-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Monthly Plan</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-white">$19</span>
                <span className="ml-1 text-gray-300">/month</span>
              </div>
              <ul className="mb-6 space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited PDF Processing
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  AI-Generated Quizzes
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Progress Tracking
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 