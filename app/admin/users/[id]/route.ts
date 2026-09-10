import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteIdeaFile } from '@/lib/supabaseStorage';

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

// DELETE /api/admin/users/[id] — admin-only, fully removes a user and
// everything tied to them: their own ideas (with attachments/views/interests
// on those ideas), and anything they created as an investor.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // If they're an idea maker, remove each of their ideas' storage files and
  // dependent records first (same cleanup as a normal idea delete).
  const ideas = await db.idea.findMany({ where: { makerId: params.id } });
  for (const idea of ideas) {
    const attachments = await db.ideaAttachment.findMany({ where: { ideaId: idea.id } });
    for (const a of attachments) {
      try {
        await deleteIdeaFile(a.storagePath);
      } catch (e) {
        console.error('Failed to delete storage file during user delete:', e);
      }
    }
  }

  const ideaIds = ideas.map((i) => i.id);

  await db.$transaction([
    db.ideaAttachment.deleteMany({ where: { ideaId: { in: ideaIds } } }),
    db.interestSubmission.deleteMany({ where: { OR: [{ ideaId: { in: ideaIds } }, { investorId: params.id }] } }),
    db.ideaView.deleteMany({ where: { OR: [{ ideaId: { in: ideaIds } }, { investorId: params.id }] } }),
    db.reveal.deleteMany({ where: { OR: [{ ideaId: { in: ideaIds } }, { investorId: params.id }] } }),
    db.idea.deleteMany({ where: { makerId: params.id } }),
    db.subscription.deleteMany({ where: { investorId: params.id } }),
    db.user.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
