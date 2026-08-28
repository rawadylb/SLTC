import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_ROLES = ['IDEA_MAKER', 'INVESTOR', 'ASSISTANT', 'ADMIN'];

// Only a full ADMIN can change roles. Assistants cannot reach this route.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { role } = await req.json();
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  await db.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json({ ok: true });
}
