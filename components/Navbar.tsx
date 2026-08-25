'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-700">
          sltc<span className="text-slate-400">.me</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {!session && (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              <Link href="/signup" className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}

          {session?.user.role === 'IDEA_MAKER' && (
            <>
              <Link href="/dashboard/maker" className="text-slate-600 hover:text-slate-900">My ideas</Link>
              <button onClick={() => signOut()} className="text-slate-600 hover:text-slate-900">Log out</button>
            </>
          )}

          {session?.user.role === 'INVESTOR' && (
            <>
              <Link href="/dashboard/investor" className="text-slate-600 hover:text-slate-900">Browse ideas</Link>
              <button onClick={() => signOut()} className="text-slate-600 hover:text-slate-900">Log out</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
