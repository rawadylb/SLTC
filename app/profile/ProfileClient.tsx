'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

type User = { name: string; email: string; phone: string | null; emailVerified: Date | null };

export default function ProfileClient({ user }: { user: User }) {
  const [details, setDetails] = useState({ name: user.name, phone: user.phone || '' });
  const [detailsMsg, setDetailsMsg] = useState('');

  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailMsg, setEmailMsg] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setDetailsMsg('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'details', ...details }),
    });
    const data = await res.json();
    setDetailsMsg(res.ok ? 'Saved.' : data.error || 'Something went wrong.');
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'email', ...emailForm }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmailMsg('Check your new email for a confirmation link. You\'ll be logged out shortly.');
      setTimeout(() => signOut({ callbackUrl: '/login' }), 3000);
    } else {
      setEmailMsg(data.error || 'Something went wrong.');
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'password', ...pwForm }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwMsg('Password changed.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } else {
      setPwMsg(data.error || 'Something went wrong.');
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <h1 className="text-2xl font-bold text-ink">Your profile</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-ink">Details</h2>
        <form onSubmit={saveDetails} className="mt-3 space-y-3">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            placeholder="Full name"
          />
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            placeholder="Phone (kept private until a reveal)"
          />
          {detailsMsg && <p className="text-sm text-slate-600">{detailsMsg}</p>}
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-ink">Change email</h2>
        <p className="mt-1 text-sm text-slate-500">
          Current: {user.email} {user.emailVerified ? '(verified)' : '(unverified)'}
        </p>
        <form onSubmit={changeEmail} className="mt-3 space-y-3">
          <input
            type="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
            placeholder="New email"
          />
          <input
            type="password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={emailForm.currentPassword}
            onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
            placeholder="Current password (to confirm it's you)"
          />
          {emailMsg && <p className="text-sm text-slate-600">{emailMsg}</p>}
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Change email
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-ink">Change password</h2>
        <form onSubmit={changePassword} className="mt-3 space-y-3">
          <input
            type="password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            placeholder="Current password"
          />
          <input
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            placeholder="New password (min 8 characters)"
          />
          {pwMsg && <p className="text-sm text-slate-600">{pwMsg}</p>}
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Change password
          </button>
        </form>
      </section>
    </div>
  );
}
