import { createClient } from '@supabase/supabase-js';

// Server-only client using the service role key — bypasses RLS entirely,
// so all access control happens in our own API routes (ownership checks),
// not in Supabase. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const BUCKET = 'idea-attachments';

export async function uploadIdeaFile(ideaId: string, file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop();
  const path = `${ideaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteIdeaFile(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
