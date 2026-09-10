'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: string; name: string; email: string; role: string; createdAt: Date };
type Idea = {
  id: string; title: string; summary: string; category: string;
  fundingAsk: string | null; stage: string | null; createdAt: Date;
  maker: { name: string; email: string };
  _count: { views: number; interests: number };
  attachments: { id: string; fileName: string; fileUrl: string }[];
};
type Interest = {
  id: string; phone: string; location: string; capital: string; message: string | null; createdAt: Date;
  idea: { title: string };
  investor: { name: string; email: string };
};

const emptyEdit = { title: '', summary: '', category: '', fundingAsk: '', stage: '' };

export default function AdminDashboardClient({
  isAdmin,
  stats,
  users,
  ideas,
  interests,
}: {
  isAdmin: boolean;
  stats: { userCount: number; ideaCount: number; interestCount: number };
  users: User[];
  ideas: Idea[];
  interests: Interest[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'users' | 'ideas' | 'interests' | 'assistants'>('interests');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  async function createAssistant(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/assistants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Could not create assistant');
      return;
    }
    setForm({ name: '', email: '', password: '' });
    router.refresh();
  }

  async function changeRole(userId: string, role: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Delete ${name}'s account permanently? This removes their ideas, interests, and all related data. This cannot be undone.`)) return;
    setDeletingUserId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    setDeletingUserId(null);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Could not delete this user.');
      return;
    }
    router.refresh();
  }

  function startEditIdea(idea: Idea) {
    setEditingIdeaId(idea.id);
    setEditForm({
      title: idea.title,
      summary: idea.summary,
      category: idea.category,
      fundingAsk: idea.fundingAsk || '',
      stage: idea.stage || '',
    });
    setEditError('');
  }

  async function saveIdeaEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingIdeaId) return;
    setEditLoading(true);
    setEditError('');

    const res = await fetch(`/api/ideas/${editingIdeaId}`, {
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

    setEditingIdeaId(null);
    router.refresh();
  }

  async function deleteIdea(ideaId: string) {
    if (!confirm('Delete this idea and its attached files? This cannot be undone.')) return;
    setDeletingIdeaId(ideaId);
    const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' });
    setDeletingIdeaId(null);
    if (!res.ok) {
      alert('Could not delete this idea. Please try again.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Users" value={stats.userCount} />
        <StatCard label="Ideas posted" value={stats.ideaCount} />
        <StatCard label="Interest submissions" value={stats.interestCount} />
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <TabButton active={tab === 'interests'} onClick={() => setTab('interests')}>Investor Interest</TabButton>
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>Users</TabButton>
        <TabButton active={tab === 'ideas'} onClick={() => setTab('ideas')}>Ideas</TabButton>
        {isAdmin && (
          <TabButton active={tab === 'assistants'} onClick={() => setTab('assistants')}>Manage Assistants</TabButton>
        )}
      </div>

      {tab === 'interests' && (
        <div className="space-y-4">
          {interests.length === 0 && <p className="text-slate-500">No interest submissions yet.</p>}
          {interests.map((i) => (
            <div key={i.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-ink">{i.idea.title}</h3>
                <span className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <strong>{i.investor.name}</strong> — {i.investor.email}
              </p>
              <div className="mt-1 grid grid-cols-2 gap-x-4 text-sm text-slate-600 sm:grid-cols-3">
                <span>Phone: {i.phone}</span>
                <span>Location: {i.location}</span>
                <span>Capital: {i.capital}</span>
              </div>
              {i.message && <p className="mt-2 text-sm text-slate-500">"{i.message}"</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                {isAdmin && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="IDEA_MAKER">Idea Maker</option>
                          <option value="INVESTOR">Investor</option>
                          <option value="ASSISTANT">Assistant</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          disabled={deletingUserId === u.id}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingUserId === u.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ideas' && (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="rounded-lg border border-slate-200 bg-white p-4">
              {editingIdeaId === idea.id ? (
                <form onSubmit={saveIdeaEdit} className="space-y-3">
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
                    rows={3}
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
                      onClick={() => setEditingIdeaId(null)}
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
                    <span className="text-xs text-slate-400">{idea._count.views} views · {idea._count.interests} interests</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{idea.category} · by {idea.maker.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{idea.summary}</p>
                  {idea.attachments.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {idea.attachments.map((a) => (
                        <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">
                          {a.fileName}
                        </a>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startEditIdea(idea)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        disabled={deletingIdeaId === idea.id}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingIdeaId === idea.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'assistants' && isAdmin && (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-ink">Create an Assistant account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Assistants can view users, ideas, and investor interest, but can't change roles, edit/delete content, or access this creation form.
          </p>
          <form onSubmit={createAssistant} className="mt-4 space-y-3">
            <input
              placeholder="Full name"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Temporary password (min 8 chars)"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create assistant account'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 ${active ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
    >
      {children}
    </button>
  );
}
