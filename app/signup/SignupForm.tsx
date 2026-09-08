'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { COUNTRY_CODES } from '@/lib/countryCodes';

export default function SignupForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState(params.get('role') === 'INVESTOR' ? 'INVESTOR' : 'IDEA_MAKER');
  const [form, setForm] = useState({ name: '', email: '', password: '', countryCode: '+961', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || data.error || 'Something went wrong');
      return;
    }

    router.push('/verify-email');
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-ink">Create your account</h1>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setRole('IDEA_MAKER')}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${role === 'IDEA_MAKER' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
        >
          Idea Maker
        </button>
        <button
          type="button"
          onClick={() => setRole('INVESTOR')}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${role === 'INVESTOR' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
        >
          Investor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

        <div className="flex gap-2">
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} {c.name}</option>
            ))}
          </select>
          <input
            placeholder="Phone number"
            required
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
          />
        </div>
        <p className="-mt-2 text-xs text-slate-400">Kept private until we connect you with someone.</p>

        <input
          type="password"
          placeholder="Password (min 8 characters)"
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
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}
