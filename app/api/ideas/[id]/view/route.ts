import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Records that this investor viewed this idea. Idea makers only ever see the
// aggregate count (_count.views) — never who these records belong to.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    return NextResponse.json({ error: 'Investor account required' }, { status: 403 });
  }

  await db.ideaView.upsert({
    where: { ideaId_investorId: { ideaId: params.id, investorId: session.user.id } },
    update: {},
    create: { ideaId: params.id, investorId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
