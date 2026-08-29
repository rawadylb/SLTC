import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import InvestorDashboardClient from './InvestorDashboardClient';

export default async function InvestorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') redirect('/login');

  const ideas = await db.idea.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      interests: { where: { investorId: session.user.id } },
    },
  });

  const investor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  return <InvestorDashboardClient ideas={ideas} investorPhone={investor?.phone || ''} />;
}
