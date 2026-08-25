import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, REVEAL_FEE_CENTS } from '@/lib/stripe';
import { db } from '@/lib/db';

// Creates a Stripe Checkout session for the flat one-time "reveal contact" fee.
// On successful payment (handled in the webhook) a Reveal record unlocks
// mutual contact info between the idea maker and this investor.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    return NextResponse.json({ error: 'Investor account required' }, { status: 403 });
  }

  const { ideaId } = await req.json();
  const idea = await db.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });

  const existing = await db.reveal.findUnique({
    where: { ideaId_investorId: { ideaId, investorId: session.user.id } },
  });
  if (existing?.status === 'paid') {
    return NextResponse.json({ error: 'Already revealed' }, { status: 409 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: REVEAL_FEE_CENTS,
          product_data: {
            name: `Reveal contact info — "${idea.title}"`,
            description: 'Unlocks mutual contact details between you and the idea maker.',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/ideas/${ideaId}?revealed=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/ideas/${ideaId}`,
    metadata: { ideaId, investorId: session.user.id, kind: 'reveal' },
  });

  return NextResponse.json({ url: checkout.url });
}
