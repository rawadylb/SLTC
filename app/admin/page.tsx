import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role as string | undefined;
  if (!session || (role !== 'ADMIN' && role !== 'ASSISTANT')) {
    redirect('/login');
  }

  const isAdmin = role === 'ADMIN';

  const [userCount, ideaCount, interestCount, users, ideas, interests] = await Promise.all([
    db.user.count(),
    db.idea.count(),
    db.interestSubmission.count(),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      take: 100,
    }),
    db.idea.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, category: true, createdAt: true,
        maker: { select: { name: true, email: true } },
        _count: { select: { views: true, interests: true } },
      },
      take: 100,
    }),
    db.interestSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, phone: true, location: true, capital: true, message: true, createdAt: true,
        idea: { select: { title: true } },
        investor: { select: { name: true, email: true } },
      },
      take: 100,
    }),
  ]);

  return (
    <AdminDashboardClient
      isAdmin={isAdmin}
      stats={{ userCount, ideaCount, interestCount }}
      users={users}
      ideas={ideas}
      interests={interests}
    />
  );
}
