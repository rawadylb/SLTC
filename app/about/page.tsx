export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-16">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          SLTC — Turn ideas to opportunities.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          We connect people with real business ideas to investors who are ready to back them.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold text-ink">Our story</h2>
        <p className="mt-3 text-slate-600">
          For 10 years, we've worked to bring idea makers and investors together — helping
          people with a real business idea find the capital and partners to make it happen,
          while giving investors a private, curated way to discover opportunities worth
          backing.
        </p>
        <p className="mt-3 text-slate-600">
          sltc.me is the next step in that work: a dedicated platform where ideas get posted
          privately, investors express genuine interest, and our team makes the introduction
          — no unwanted outreach on either side.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold text-ink">What we've helped bring to life</h2>
        <p className="mt-3 text-slate-600">
          Examples of ideas we've helped connect with the right investors coming soon.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-xl font-bold text-ink">Get in touch</h2>
        <p className="mt-2 text-slate-600">
          Questions about an idea, an investment, or the platform itself?
        </p>
        <a href="mailto:sltc@sltc.me" className="mt-3 inline-block text-brand-600 font-medium hover:underline">
          sltc@sltc.me
        </a>
      </section>
    </div>
  );
}
