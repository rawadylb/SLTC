'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <svg width="60" height="60" viewBox="0 0 200 200" aria-hidden="true">
            <g transform="translate(40,10) scale(0.6)">
              <g strokeWidth="4" strokeLinecap="round" fill="none">
                <line x1="100" y1="0" x2="100" y2="18" stroke="#0F172A" />
                <line x1="45" y1="18" x2="57" y2="30" stroke="#0F172A" />
                <line x1="155" y1="18" x2="143" y2="30" stroke="#2563EB" />
                <line x1="15" y1="70" x2="35" y2="70" stroke="#0F172A" />
                <line x1="185" y1="70" x2="165" y2="70" stroke="#2563EB" />
                <line x1="30" y1="118" x2="45" y2="108" stroke="#0F172A" />
                <line x1="170" y1="118" x2="155" y2="108" stroke="#2563EB" />
              </g>
              <path d="M 100 20 A 52 52 0 1 0 148 90" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              <path d="M 148 90 A 52 52 0 0 0 100 20" fill="none" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
              <path d="M 86 40 Q 60 72 86 104" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              <path d="M 114 52 Q 134 72 114 92" fill="none" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
              <rect x="82" y="126" width="36" height="14" rx="3" fill="none" stroke="#0F172A" strokeWidth="4" />
              <line x1="86" y1="146" x2="114" y2="146" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
          <span className="text-xl font-bold text-ink">
            sltc<span className="text-brand-600">.me</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-slate-600 hover:text-slate-900">About</Link>

          {!session && (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              <Link href="/signup" className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}

          {session?.user.role === 'IDEA_MAKER' && (
            <Link href="/dashboard/maker" className="text-slate-600 hover:text-slate-900">My ideas</Link>
          )}

          {session?.user.role === 'INVESTOR' && (
            <Link href="/dashboard/investor" className="text-slate-600 hover:text-slate-900">Browse ideas</Link>
          )}

          {(session?.user.role === 'ADMIN' || session?.user.role === 'ASSISTANT') && (
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">Admin</Link>
          )}

          {session && (
            <>
              <Link href="/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
              <button onClick={() => signOut()} className="text-slate-600 hover:text-slate-900">Log out</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
