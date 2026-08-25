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
          Post your dream, or discover the next one. Real ideas, real investors —
          contact stays private until you both say yes.
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
            Idea makers post ideas for free. Investors subscribe to browse the full feed —
            no names or contact details attached to any listing.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">2. Find a fit</h3>
          <p className="mt-2 text-sm text-slate-600">
            Investors can see a summary, category, funding ask, and stage — enough to judge
            interest without either side being contacted unsolicited.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">3. Reveal & connect</h3>
          <p className="mt-2 text-sm text-slate-600">
            When an investor is genuinely interested, a small reveal fee unlocks mutual
            contact info for both sides — no unwanted outreach either way.
          </p>
        </div>
      </section>
    </div>
  );
}
