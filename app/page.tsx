import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Where ideas find their believers.
        </h1>
        <p className="mx-auto mt-4 max-w-xl italic text-slate-500">
          "Live out of your imagination, not your history." — Stephen Covey
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Here your dreams comes true, your powerfull project ideas will become real —
          Send your ideas how much you need and your contact information.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup?role=IDEA_MAKER" className="rounded-md bg-brand-600 px-5 py-3 text-white font-medium hover:bg-brand-700">
            I have an idea
          </Link>
          <Link href="/signup?role=INVESTOR" className="rounded-md border border-brand-600 px-5 py-3 text-brand-700 font-medium hover:bg-brand-50">
            I want to invest
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">1. Post or Browse</h3>
          <p className="mt-2 text-sm text-slate-600">
            Sign up as idea maker to post your ideas here you can start your project with real investor
            Be diffirent and attract the invostors in your way.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">2. Express interest</h3>
          <p className="mt-2 text-sm text-slate-600">
            Maybe one grat idea will change your life for ever don't give up
            invest in your ideas, this is you capital.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">3. We connect you</h3>
          <p className="mt-2 text-sm text-slate-600">
            we will let dreamers meets capitals —
            Set your goals in sltc.me the right place.
          </p>
        </div>
      </section>
    </div>
  );
}
