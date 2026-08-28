'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VerifyEmailContent() {
  const params = useSearchParams();
  const status = params.get('status');

  return (
    <div className="mx-auto max-w-md text-center">
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-ink">Email confirmed</h1>
          <p className="mt-2 text-slate-600">Your account is now active. You can log in.</p>
          <Link href="/login" className="mt-6 inline-block rounded-md bg-brand-600 px-5 py-2 text-white font-medium hover:bg-brand-700">
            Go to login
          </Link>
        </>
      )}
      {status === 'invalid' && (
        <>
          <h1 className="text-2xl font-bold text-ink">Link no longer valid</h1>
          <p className="mt-2 text-slate-600">This confirmation link has already been used or doesn't exist.</p>
        </>
      )}
      {!status && (
        <>
          <h1 className="text-2xl font-bold text-ink">Check your inbox</h1>
          <p className="mt-2 text-slate-600">
            We sent a confirmation link to your email. Click it to activate your account before logging in.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-center text-slate-500">Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
