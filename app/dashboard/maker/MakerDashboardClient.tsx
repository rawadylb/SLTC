'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Idea = {
  id: string;
  title: string;
  summary: string;
  category: string;
  fundingAsk: string | null;
  stage: string | null;
  _count: { views: number };
  reveals: { investor: { name: string; email: string; phone: string | null } }[];
};

export default function MakerDashboardClient({ ideas }: { ideas: Idea[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', category: '', fundingAsk: '', stage: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || 'Could not post idea');
      return;
    }

    setForm({ title: '', summary: '', category: '', fundingAsk: '', stage: '' });
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-ink">Post a new idea</h1>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <input
            placeholder="Title"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Summary — describe the idea (no contact info needed here)"
            required
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Category"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              placeholder="Funding ask (optional)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.fundingAsk}
              onChange={(e) => setForm({ ...form, fundingAsk: e.target.value })}
            />
            <input
              placeholder="Stage (optional)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post idea'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Your ideas</h2>
        <div className="mt-4 space-y-4">
          {ideas.length === 0 && <p className="text-slate-500">You haven't posted any ideas yet.</p>}
          {ideas.map((idea) => (
            <div key={idea.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-ink">{idea.title}</h3>
                <span className="text-sm text-slate-500">{idea._count.views} view{idea._count.views === 1 ? '' : 's'}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{idea.summary}</p>

              {idea.reveals.length > 0 && (
                <div className="mt-3 rounded-md bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-800">
                    {idea.reveals.length} investor{idea.reveals.length > 1 ? 's' : ''} unlocked your contact info:
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-green-700">
                    {idea.reveals.map((r, i) => (
                      <li key={i}>{r.investor.name} — {r.investor.email}{r.investor.phone ? ` — ${r.investor.phone}` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
