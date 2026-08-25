import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const ideaSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(20),
  category: z.string().min(1),
  fundingAsk: z.string().optional(),
  stage: z.string().optional(),
});

// GET /api/ideas — list ideas for the current investor. Maker identity/contact
// is NEVER included here — only revealed via a paid Reveal record.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  if (session.user.role === 'INVESTOR') {
    const sub = await db.subscription.findUnique({ where: { investorId: session.user.id } });
    const active = sub && sub.status === 'active' && sub.currentPeriodEnd > new Date();
    if (!active) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 402 });
    }
  }

  const ideas = await db.idea.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      fundingAsk: true,
      stage: true,
      createdAt: true,
      // Note: no `maker` relation selected — identity stays hidden by default
      _count: { select: { views: true } },
      reveals: session.user.role === 'INVESTOR'
        ? { where: { investorId: session.user.id } }
        : false,
    },
  });

  return NextResponse.json(ideas);
}

// POST /api/ideas — idea makers post a new idea
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') {
    return NextResponse.json({ error: 'Only idea makers can post ideas' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ideaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const idea = await db.idea.create({
    data: { ...parsed.data, makerId: session.user.id },
  });

  return NextResponse.json(idea);
}
