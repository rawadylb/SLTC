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

// PATCH /api/ideas/[id] — idea maker edits their own idea
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') {
    return NextResponse.json({ error: 'Only idea makers can edit ideas' }, { status: 403 });
  }

  const idea = await db.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  if (idea.makerId !== session.user.id) {
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

// DELETE /api/ideas/[id] — idea maker deletes their own idea, and any
// dependent view/interest records that reference it.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') {
    return NextResponse.json({ error: 'Only idea makers can delete ideas' }, { status: 403 });
  }

  const idea = await db.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  if (idea.makerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only delete your own ideas' }, { status: 403 });
  }

  // Remove the actual files from storage first (best-effort — don't block
  // deletion if a file is already gone or storage has a hiccup).
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
