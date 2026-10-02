# BentoFolio

A creative bento portfolio builder built with Next.js, Supabase, Lemon Squeezy, and a block-based editor.

## Current Product Structure

- **Free**: core portfolio blocks, built-in visual styles, public `bentofolio.dev/[username]` profile, GitHub import, and the Creative tab.
- **Pro**: `$9` lifetime for custom domains, analytics, and premium blocks.
- **Creative tab**: a Notion-style public workspace block for notes, case studies, experiments, moodboards, and external Notion links.

## Main App Areas

- `app/page.tsx`: landing page.
- `app/editor/page.tsx`: authenticated editor shell.
- `app/editor/BlockEditor.tsx`: block content editor.
- `app/components/blocks/*`: public block renderers.
- `app/[username]/page.tsx`: public portfolio route.
- `app/api/profile/route.ts`: profile save/load and custom-domain gate.
- `app/api/checkout/route.ts`: Lemon Squeezy checkout.
- `app/api/webhooks/lemonsqueezy/route.ts`: Pro upgrade/refund webhook.
- `app/lib/supabase/middleware.ts`: auth refresh plus custom-domain root rewrite.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_VARIANT_ID=your_9_dollar_lifetime_variant_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Optional beta fallback while the BentoFolio Lemon Squeezy store is pending.
NEXT_PUBLIC_BETA_PAYMENT_LINK=your_temporary_payment_or_waitlist_url

RESEND_API_KEY=optional_resend_key
```

For production, set `NEXT_PUBLIC_APP_URL` to your real app domain, for example:

```bash
NEXT_PUBLIC_APP_URL=https://bentofolio.dev
```

## Supabase Setup

Run the SQL in this order:

1. `supabase/schema.sql`
2. `supabase/migrations/003_pro_and_analytics.sql`
3. `supabase/migrations/004_update_theme_constraint.sql`
4. `supabase/migrations/004_custom_domain.sql`
5. `supabase/migrations/005_analytics.sql`

Important profile fields:

- `id`: auth user id.
- `username`: public profile slug.
- `theme`: selected theme id.
- `layout`: JSON block layout.
- `content`: JSON block content.
- `is_pro`: enables Pro features.
- `custom_domain`: paid custom domain, unique.
- `lemon_squeezy_order_id`: payment reference.

## Pro Flow

1. User clicks Pro on `/pricing`.
2. `/api/checkout` reads the authenticated Supabase user server-side.
3. Lemon Squeezy receives `custom.user_id`.
4. Webhook verifies `X-Signature`.
5. On paid `order_created`, webhook updates `profiles.id = user_id`:

```sql
is_pro = true
upgraded_at = now()
lemon_squeezy_order_id = order_id
```

6. Editor unlocks custom domain input, analytics, and premium block access.

## Beta Launch Flow

Use `$9` lifetime for the first beta users.

- Keep public profiles free.
- Create a Lemon Squeezy discount code named `BETA90` for 90% off the `$9`
  beta product if you want a public launch coupon.
- Add private 100% friend codes to the `beta_codes` table (see
  `supabase/migrations/010_secure_pro_and_beta_codes.sql`), with a `max_uses`
  limit. When a signed-in user enters one on `/pricing`, the server redeems it
  and marks that profile as Pro. Never put codes in the source code.
- If the BentoFolio Lemon Squeezy store is not approved yet, set
  `NEXT_PUBLIC_BETA_PAYMENT_LINK` to a temporary payment or waitlist link.
- After a beta user pays, manually update their profile in Supabase:

```sql
update profiles
set is_pro = true,
    upgraded_at = now()
where username = 'their_username';
```

- Once the BentoFolio store is approved, set the real Lemon Squeezy env vars and
  remove the beta fallback link.

## Invite & Earn

`/invite` lets a signed-in user add a friend's email and generate a referral
link. The friend must create and confirm a BentoFolio account from that
`/auth/signup?ref=...` link.

Run the referral migration before enabling this in production:

```sql
-- supabase/migrations/008_referrals.sql
```

When 5 referred accounts are confirmed, BentoFolio creates a private
`COUPON100-...` reward code, emails it to the referrer through Resend, and lets
that user redeem the code on `/pricing` for Pro.

Custom domains are enforced server-side in `/api/profile`; non-Pro users cannot save `customDomain`.

## Pro Features

- Custom domain support
- Analytics dashboard
- Premium blocks:
  `github`, `experience`, `saas`, `metrics`, `spotify`, `network`, `career`

## Custom Domain Setup

The app rewrites custom-domain root traffic in middleware:

- If host is not the app host, localhost, or `*.vercel.app`
- And path is `/`
- It looks up `profiles.custom_domain = host`
- If profile is Pro, it rewrites to `/{username}`

Domain DNS examples:

```text
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

Also add the domain in your hosting provider dashboard.

## Creative Tab Data

The Creative block content shape:

```ts
{
  type: "creative",
  data: {
    title: "Creative Desk",
    description: "Public workspace for notes and case studies.",
    notionUrl: "https://notion.site/...",
    ctaLabel: "Explore my notes",
    ctaUrl: "https://...",
    items: [
      {
        title: "Design systems notes",
        type: "Notion page",
        status: "Public",
        url: "https://..."
      }
    ]
  }
}
```

## Removed Route

`/themes` was removed. Theme selection now lives directly inside `/editor`.

## Development

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
```

Open `http://localhost:3000`.

## Notes

- Next 16 warns that `middleware.ts` should eventually migrate to the `proxy` convention.
- Production build may need investigation if Turbopack hangs at `Creating an optimized production build ...`.
- Image uploads are still stored as base64 in profile JSON; Supabase Storage should replace that before heavy production use.

## Verified revenue (SaaS block)

Founders can connect Stripe or Lemon Squeezy to a SaaS block so its MRR and
monthly revenue come from the provider and show as "Verified".

- Run `supabase/migrations/014_revenue_connections.sql`, then `015_revenue_total.sql`.
- Set two server variables in Vercel (Production and Preview):
  - `REVENUE_ENCRYPTION_KEY`: 32 random bytes, base64. Generate with
    `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
    Never change it once keys are stored, or they can't be decrypted.
  - `CRON_SECRET`: any long random string. Vercel sends it to
    `/api/cron/revenue`, which refreshes every connection daily (`vercel.json`).
- Stripe: only restricted `rk_` keys are accepted (Read on Subscriptions and
  Invoices). Secret `sk_` keys are refused.
- Lemon Squeezy keys can't be read-only; the editor warns before connecting.
- Keys are encrypted (AES-256-GCM) in a table only the server can read.
  Public pages read numbers through `public_verified_revenue()`, so the
  Verified badge can't be faked by editing page data.
