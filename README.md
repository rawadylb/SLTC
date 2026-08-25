# sltc.me — Idea Marketplace

Idea makers post ideas for free. Investors pay $50/year to browse the feed.
Contact info for both sides stays hidden until an investor pays a flat
"reveal" fee (placeholder $49, set via env var — change any time, no code
changes needed).

## What's built

- Email/password auth (NextAuth) with two roles: `IDEA_MAKER`, `INVESTOR`
- Idea maker: post ideas, see an anonymized view counter, see contact info
  of any investor who paid to reveal
- Investor: $50/year Stripe subscription gate, browse full feed, pay a flat
  fee per idea to unlock mutual contact info
- Stripe Checkout + webhook for both the subscription and the reveal fee
- Postgres schema (Prisma) — contact info is never returned by any API
  route unless a paid `Reveal` record exists for that investor+idea pair

## What's NOT built yet (roadmap)

- Admin moderation dashboard for reviewing/removing posted ideas
- Email notifications (idea posted, contact revealed, subscription renewal)
- Password reset flow
- Real % success-fee tracking on deal size — deliberately left out of MVP;
  see the note below on why

## 1. Local setup

```bash
npm install
cp .env.example .env      # fill in real values, see below
npm run db:push           # creates tables in your Postgres database
npm run dev                # http://localhost:3000
```

## 2. Get a Postgres database

Easiest options (both have free tiers): **Supabase** or **Neon**. Create a
project, copy the connection string into `DATABASE_URL` in `.env`.

## 3. Set up Stripe

1. Create a Stripe account, grab your secret key → `STRIPE_SECRET_KEY`
2. In Stripe Dashboard → Products, create a **recurring $50/year** price
   for "Investor Subscription" → copy its price ID into
   `STRIPE_INVESTOR_SUBSCRIPTION_PRICE_ID`
3. Set `STRIPE_REVEAL_FEE_CENTS` to whatever flat reveal fee you land on
   (currently a placeholder — 4900 = $49.00)
4. Add a webhook endpoint pointing at
   `https://sltc.me/api/stripe/webhook`, subscribed to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## 4. Deploy

Recommended: **Vercel** (built by the Next.js team, zero-config for this
stack).

1. Push this folder to a GitHub repo
2. Import it in Vercel, add all the `.env` variables in the Vercel project
   settings
3. Deploy

## 5. Point sltc.me at it

In Vercel → your project → Settings → Domains → add `sltc.me` and
`www.sltc.me`. Vercel will show you the exact DNS records to add. At your
domain registrar (wherever you bought sltc.me):

- Add an **A record** for `@` pointing to Vercel's IP (Vercel shows the
  current value on the Domains screen)
- Add a **CNAME record** for `www` pointing to `cname.vercel-dns.com`

DNS changes can take up to a few hours to propagate.

## Why there's no % commission logic yet

A true "2.5% of the deal from both sides" model needs a real deal amount
to calculate from, and that transaction happens off-platform between the
idea maker and investor — nothing stops either party from simply not
reporting it, so it's not enforceable as built. Two ways to actually get
there, worth thinking about once you have traction:

1. **Self-reported deal size** — cheap to add (one form + manual/Stripe
   invoicing), but relies on honesty.
2. **Route the actual investment through the platform** (escrow) — closes
   the enforcement gap, but arranging securities transactions for a fee
   can trigger broker-dealer / finder's-fee regulation depending on your
   jurisdiction. Worth a conversation with a lawyer before building this
   path — it's a legal decision as much as a technical one.

The flat reveal fee sidesteps both problems for now: you get paid the
moment contact info is exchanged, full stop.
