import { loadStripe } from '@stripe/stripe-js';

// Client-side Stripe promise
let stripePromise = null;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const PLANS = {
  FREE: {
    name: 'Free',
    quizLimit: 3,
    questionLimit: 20,
    price: 0,
    features: [
      '3 quizzes per month',
      'Up to 20 questions per quiz',
      'All file formats'
    ]
  },
  PRO: {
    name: 'Pro',
    quizLimit: -1, // Unlimited
    questionLimit: 20,
    price: 1999, // $19.99
    stripePriceId: 'price_1Qw7W44SgsSTJ8c9nn6Jtpj2',
    features: [
      'Unlimited quizzes',
      'Up to 20 questions per quiz',
      'All file formats',
      'Unlimited note storage'
    ]
  }
}; 