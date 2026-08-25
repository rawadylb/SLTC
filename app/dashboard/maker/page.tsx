import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import MakerDashboardClient from './MakerDashboardClient';

export default async function MakerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'IDEA_MAKER') redirect('/login');

  const ideas = await db.idea.findMany({
    where: { makerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { views: true } },
      reveals: {
        where: { status: 'paid' },
        include: { investor: { select: { name: true, email: true, phone: true } } },
      },
    },
  });

  return <MakerDashboardClient ideas={ideas} />;
}
