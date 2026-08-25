import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const kind = checkoutSession.metadata?.kind;

      if (kind === 'subscription') {
        const investorId = checkoutSession.metadata!.investorId;
        const stripeSubscriptionId = checkoutSession.subscription as string;
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        await db.subscription.upsert({
          where: { investorId },
          create: {
            investorId,
            stripeCustomerId: checkoutSession.customer as string,
            stripeSubscriptionId,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          update: {
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }

      if (kind === 'reveal') {
        const { ideaId, investorId } = checkoutSession.metadata!;
        await db.reveal.upsert({
          where: { ideaId_investorId: { ideaId, investorId } },
          create: {
            ideaId,
            investorId,
            amountCents: checkoutSession.amount_total ?? 0,
            stripePaymentIntent: checkoutSession.payment_intent as string,
            status: 'paid',
          },
          update: {
            status: 'paid',
            stripePaymentIntent: checkoutSession.payment_intent as string,
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
