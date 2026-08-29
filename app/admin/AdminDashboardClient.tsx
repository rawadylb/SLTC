'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: string; name: string; email: string; role: string; createdAt: Date };
type Idea = {
  id: string; title: string; category: string; createdAt: Date;
  maker: { name: string; email: string };
  _count: { views: number; interests: number };
};
type Interest = {
  id: string; phone: string; location: string; capital: string; message: string | null; createdAt: Date;
  idea: { title: string };
  investor: { name: string; email: string };
};

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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ideas' && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Maker</th>
                <th className="px-4 py-2">Views</th>
                <th className="px-4 py-2">Interests</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{idea.title}</td>
                  <td className="px-4 py-2 text-slate-500">{idea.category}</td>
                  <td className="px-4 py-2 text-slate-500">{idea.maker.name}</td>
                  <td className="px-4 py-2">{idea._count.views}</td>
                  <td className="px-4 py-2">{idea._count.interests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'assistants' && isAdmin && (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-ink">Create an Assistant account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Assistants can view users, ideas, and investor interest, but can't change roles or access this creation form.
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
