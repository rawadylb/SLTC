import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { containsContactInfo, CONTACT_INFO_ERROR } from '@/lib/contentCheck';
import { deleteIdeaFile } from '@/lib/supabaseStorage';

const updateSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(20),
  category: z.string().min(1),
  fundingAsk: z.string().optional(),
  stage: z.string().optional(),
});

function canManage(idea: { makerId: string }, userId: string, role: string) {
  return idea.makerId === userId || role === 'ADMIN';
}

// PATCH /api/ideas/[id] — the idea's own maker, or an admin, can edit it
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'IDEA_MAKER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Not authorized to edit ideas' }, { status: 403 });
  }

  const idea = await db.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  if (!canManage(idea, session.user.id, session.user.role)) {
    return NextResponse.json({ error: 'You can only edit your own ideas' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (containsContactInfo(parsed.data.title) || containsContactInfo(parsed.data.summary)) {
    return NextResponse.json({ error: CONTACT_INFO_ERROR }, { status: 400 });
  }

  const updated = await db.idea.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

// DELETE /api/ideas/[id] — the idea's own maker, or an admin, can delete it,
// along with any dependent view/interest/attachment records.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'IDEA_MAKER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Not authorized to delete ideas' }, { status: 403 });
  }

  const idea = await db.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  if (!canManage(idea, session.user.id, session.user.role)) {
    return NextResponse.json({ error: 'You can only delete your own ideas' }, { status: 403 });
  }

  const attachments = await db.ideaAttachment.findMany({ where: { ideaId: params.id } });
  for (const a of attachments) {
    try {
      await deleteIdeaFile(a.storagePath);
    } catch (e) {
      console.error('Failed to delete storage file during idea delete:', e);
    }
  }

  await db.$transaction([
    db.ideaAttachment.deleteMany({ where: { ideaId: params.id } }),
    db.interestSubmission.deleteMany({ where: { ideaId: params.id } }),
    db.ideaView.deleteMany({ where: { ideaId: params.id } }),
    db.reveal.deleteMany({ where: { ideaId: params.id } }),
    db.idea.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
