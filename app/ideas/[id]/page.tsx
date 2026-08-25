import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function IdeaDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') redirect('/login');

  const idea = await db.idea.findUnique({
    where: { id: params.id },
    include: {
      reveals: { where: { investorId: session.user.id, status: 'paid' } },
    },
  });
  if (!idea) notFound();

  const revealed = idea.reveals.length > 0;
  const maker = revealed
    ? await db.user.findUnique({
        where: { id: idea.makerId },
        select: { name: true, email: true, phone: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink">{idea.title}</h1>
      <p className="mt-1 text-sm text-slate-500">{idea.category}{idea.stage ? ` · ${idea.stage}` : ''}</p>
      <p className="mt-4 text-slate-700">{idea.summary}</p>
      {idea.fundingAsk && <p className="mt-2 text-sm text-slate-500">Funding ask: {idea.fundingAsk}</p>}

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        {revealed && maker ? (
          <>
            <h2 className="font-semibold text-green-700">✓ Contact info unlocked</h2>
            <p className="mt-2 text-sm text-slate-700">{maker.name} — {maker.email}{maker.phone ? ` — ${maker.phone}` : ''}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Contact info is hidden. Go back to your dashboard to reveal it.
          </p>
        )}
      </div>
    </div>
  );
}
