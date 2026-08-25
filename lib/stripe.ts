import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Flat fee charged to an investor to reveal an idea maker's contact info.
// Change this any time in your environment variables — no code change needed.
export const REVEAL_FEE_CENTS = parseInt(process.env.STRIPE_REVEAL_FEE_CENTS || '4900', 10);
