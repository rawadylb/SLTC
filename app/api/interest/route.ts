import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendInterestNotification } from '@/lib/email';

const schema = z.object({
  ideaId: z.string(),
  phone: z.string().min(3),
  location: z.string().min(1),
  capital: z.string().min(1),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    return NextResponse.json({ error: 'Investor account required' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
  }
  const { ideaId, phone, location, capital, message } = parsed.data;

  const idea = await db.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });

  // Track an anonymized view for the idea maker, same as before.
  await db.ideaView.upsert({
    where: { ideaId_investorId: { ideaId, investorId: session.user.id } },
    update: {},
    create: { ideaId, investorId: session.user.id },
  });

  const submission = await db.interestSubmission.upsert({
    where: { ideaId_investorId: { ideaId, investorId: session.user.id } },
    update: { phone, location, capital, message },
    create: { ideaId, investorId: session.user.id, phone, location, capital, message },
  });

  const investor = await db.user.findUnique({ where: { id: session.user.id } });
  const admins = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'ASSISTANT'] } },
    select: { email: true },
  });

  try {
    await sendInterestNotification(
      admins.map((a) => a.email),
      {
        ideaTitle: idea.title,
        ideaId: idea.id,
        investorName: investor?.name || 'Unknown',
        investorEmail: investor?.email || 'Unknown',
        phone,
        location,
        capital,
        message,
      }
    );
  } catch (e) {
    console.error('Failed to send interest notification:', e);
  }

  return NextResponse.json({ ok: true, id: submission.id });
}
