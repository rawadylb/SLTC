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
};

const emptyForm = { title: '', summary: '', category: '', fundingAsk: '', stage: '' };

export default function MakerDashboardClient({ ideas }: { ideas: Idea[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

    setForm(emptyForm);
    router.refresh();
  }

  function startEdit(idea: Idea) {
    setEditingId(idea.id);
    setEditForm({
      title: idea.title,
      summary: idea.summary,
      category: idea.category,
      fundingAsk: idea.fundingAsk || '',
      stage: idea.stage || '',
    });
    setEditError('');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditLoading(true);
    setEditError('');

    const res = await fetch(`/api/ideas/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });

    setEditLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error?.formErrors?.[0] || data.error || 'Could not save changes');
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(ideaId: string) {
    if (!confirm('Delete this idea permanently? This cannot be undone.')) return;
    setDeletingId(ideaId);

    const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' });

    setDeletingId(null);

    if (!res.ok) {
      alert('Could not delete this idea. Please try again.');
      return;
    }

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
              {editingId === idea.id ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input
                    placeholder="Title"
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Summary"
                    required
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      placeholder="Category"
                      required
                      className="rounded-md border border-slate-300 px-3 py-2"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    />
                    <input
                      placeholder="Funding ask"
                      className="rounded-md border border-slate-300 px-3 py-2"
                      value={editForm.fundingAsk}
                      onChange={(e) => setEditForm({ ...editForm, fundingAsk: e.target.value })}
                    />
                    <input
                      placeholder="Stage"
                      className="rounded-md border border-slate-300 px-3 py-2"
                      value={editForm.stage}
                      onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                    />
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {editLoading ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-ink">{idea.title}</h3>
                    <span className="text-sm text-slate-500">{idea._count.views} view{idea._count.views === 1 ? '' : 's'}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{idea.summary}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(idea)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      disabled={deletingId === idea.id}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === idea.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
