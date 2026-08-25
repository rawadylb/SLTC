import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import InvestorDashboardClient from './InvestorDashboardClient';

export default async function InvestorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') redirect('/login');

  const sub = await db.subscription.findUnique({ where: { investorId: session.user.id } });
  const active = !!sub && sub.status === 'active' && sub.currentPeriodEnd > new Date();

  const ideas = active
    ? await db.idea.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          fundingAsk: true,
          stage: true,
          _count: { select: { views: true } },
          reveals: { where: { investorId: session.user.id, status: 'paid' } },
        },
      })
    : [];

  return <InvestorDashboardClient active={active} ideas={ideas} />;
}
