import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteIdeaFile } from '@/lib/supabaseStorage';

export async function DELETE(_req: Request, { params }: { params: { attachmentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') {
    return NextResponse.json({ error: 'Only idea makers can delete attachments' }, { status: 403 });
  }

  const attachment = await db.ideaAttachment.findUnique({
    where: { id: params.attachmentId },
    include: { idea: true },
  });
  if (!attachment) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
  if (attachment.idea.makerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only delete your own attachments' }, { status: 403 });
  }

  await deleteIdeaFile(attachment.storagePath);
  await db.ideaAttachment.delete({ where: { id: params.attachmentId } });

  return NextResponse.json({ ok: true });
}
