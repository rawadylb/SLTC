'use client';

import { useState } from 'react';

type Idea = {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  interests: unknown[];
};

export default function InvestorDashboardClient({ ideas, investorPhone }: { ideas: Idea[]; investorPhone: string }) {
  const [openIdeaId, setOpenIdeaId] = useState<string | null>(null);
  const [form, setForm] = useState({ phone: investorPhone, location: '', capital: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedIds, setSubmittedIds] = useState<string[]>(
    ideas.filter((i) => i.interests.length > 0).map((i) => i.id)
  );

  function openForm(ideaId: string) {
    setOpenIdeaId(ideaId);
    setError('');
  }

  async function submitInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!openIdeaId) return;
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: openIdeaId, ...form }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      return;
    }

    setSubmittedIds((prev) => [...prev, openIdeaId]);
    setOpenIdeaId(null);
    setForm({ phone: investorPhone, location: '', capital: '', message: '' });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Browse ideas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Titles only for now — express interest to get in front of the idea maker.
      </p>

      <div className="mt-6 space-y-3">
        {ideas.length === 0 && <p className="text-slate-500">No ideas posted yet — check back soon.</p>}
        {ideas.map((idea) => {
          const alreadySubmitted = submittedIds.includes(idea.id);
          const truncatedTitle = idea.title.length > 80 ? idea.title.slice(0, 80) + '…' : idea.title;
          return (
            <div key={idea.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{idea.category}</span>
                <h3 className="mt-1 font-semibold text-ink">{truncatedTitle}</h3>
              </div>
              {alreadySubmitted ? (
                <span className="text-sm font-medium text-green-700 whitespace-nowrap">✓ Interest sent</span>
              ) : (
                <button
                  onClick={() => openForm(idea.id)}
                  className="whitespace-nowrap rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  I'm interested
                </button>
              )}
            </div>
          );
        })}
      </div>

      {openIdeaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-bold text-ink">Express interest</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sent privately to the sltc.me team — they'll review and reach out to connect you if it's a fit.
            </p>
            <form onSubmit={submitInterest} className="mt-4 space-y-3">
              <input
                placeholder="Phone number"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                placeholder="Where you're based (country/city)"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <input
                placeholder="Approximate capital available to invest"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.capital}
                onChange={(e) => setForm({ ...form, capital: e.target.value })}
              />
              <textarea
                placeholder="Anything else you'd like to add (optional)"
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpenIdeaId(null)}
                  className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Send interest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
