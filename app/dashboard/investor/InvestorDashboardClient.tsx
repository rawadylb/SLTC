'use client';

import { useState } from 'react';

type Idea = {
  id: string;
  title: string;
  summary: string;
  category: string;
  fundingAsk: string | null;
  stage: string | null;
  _count: { views: number };
  reveals: unknown[];
};

export default function InvestorDashboardClient({ active, ideas }: { active: boolean; ideas: Idea[] }) {
  const [loadingSub, setLoadingSub] = useState(false);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  async function subscribe() {
    setLoadingSub(true);
    const res = await fetch('/api/stripe/checkout-subscription', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoadingSub(false);
  }

  async function reveal(ideaId: string) {
    setRevealingId(ideaId);
    // Fire-and-forget anonymized view record
    fetch(`/api/ideas/${ideaId}/view`, { method: 'POST' }).catch(() => {});

    const res = await fetch('/api/stripe/checkout-reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setRevealingId(null);
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-ink">Unlock the idea feed</h1>
        <p className="mt-2 text-slate-600">
          $50/year gets you full access to every posted idea — category, summary, funding ask,
          and stage. Contact info stays private until you choose to reveal it.
        </p>
        <button
          onClick={subscribe}
          disabled={loadingSub}
          className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loadingSub ? 'Redirecting…' : 'Subscribe — $50/year'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Browse ideas</h1>
      <div className="mt-6 space-y-4">
        {ideas.length === 0 && <p className="text-slate-500">No ideas posted yet — check back soon.</p>}
        {ideas.map((idea) => {
          const revealed = idea.reveals.length > 0;
          return (
            <div key={idea.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">{idea.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{idea.category}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{idea.summary}</p>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                {idea.fundingAsk && <span>Ask: {idea.fundingAsk}</span>}
                {idea.stage && <span>Stage: {idea.stage}</span>}
              </div>

              <div className="mt-4">
                {revealed ? (
                  <span className="text-sm font-medium text-green-700">✓ Contact info unlocked</span>
                ) : (
                  <button
                    onClick={() => reveal(idea.id)}
                    disabled={revealingId === idea.id}
                    className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {revealingId === idea.id ? 'Redirecting…' : 'Reveal contact info'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
