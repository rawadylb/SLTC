import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

// Creates a Stripe Checkout session for the $50/year investor subscription.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    return NextResponse.json({ error: 'Investor account required' }, { status: 403 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: process.env.STRIPE_INVESTOR_SUBSCRIPTION_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/investor?subscribed=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/investor`,
    metadata: { investorId: user.id, kind: 'subscription' },
  });

  return NextResponse.json({ url: checkout.url });
}
