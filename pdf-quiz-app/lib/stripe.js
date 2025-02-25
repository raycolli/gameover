import Stripe from 'stripe';

// Only used in API routes (server-side)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe; 