import { Suspense } from 'react';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-center text-slate-500">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
