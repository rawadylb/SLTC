import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadIdeaFile } from '@/lib/supabaseStorage';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB, safely under Vercel's request body limit

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') {
    return NextResponse.json({ error: 'Only idea makers can attach files' }, { status: 403 });
  }

  const idea = await db.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  if (idea.makerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only attach files to your own ideas' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File must be under 4MB' }, { status: 400 });
  }

  try {
    const { url, path } = await uploadIdeaFile(params.id, file);
    const attachment = await db.ideaAttachment.create({
      data: {
        ideaId: params.id,
        fileName: file.name,
        fileUrl: url,
        storagePath: path,
        fileType: file.type,
        sizeBytes: file.size,
      },
    });
    return NextResponse.json(attachment);
  } catch (e: any) {
    console.error('Attachment upload failed:', e);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
