import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, emailVerified: true },
  });
  if (!user) redirect('/login');

  return <ProfileClient user={user} />;
}
