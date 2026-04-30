# BentoFolio

A creative bento portfolio builder built with Next.js, Supabase, Lemon Squeezy, and a block-based editor.

## Current Product Structure

- **Free**: all blocks, all themes, public `bentofolio.dev/[username]` profile, GitHub import, and the Creative tab.
- **Pro**: `$9` lifetime, currently only unlocks custom domains.
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
- `is_pro`: enables custom domain.
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

6. Editor unlocks custom domain input.

Custom domains are enforced server-side in `/api/profile`; non-Pro users cannot save `customDomain`.

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
