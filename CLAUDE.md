# Just5Up!

## Purpose

A motorcycle classifieds marketplace for North Macedonia — think
"AutoTrader, but bikes only." Users list bikes for sale, browse/save
others' listings, and can request dealer status (admin-approved) for a
branded storefront. Grew out of a client pitch: the accepted visual
direction is the static demo at the repo's original commit history
(`git log` for "Just5Up client rebrand") — this repo now holds the real
application behind that design.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind**
- **Supabase** — Postgres (project `moto-mk`, `eu-central-1`), Auth
  (email/password), Storage. `@supabase/ssr` for cookie-based SSR auth.
- **Deploy target: Vercel.**
- No ORM — plain `supabase-js` queries. Types in `src/lib/database.types.ts`
  are generated from the live schema (`generate_typescript_types`); this file
  is regenerated, never hand-edited, whenever a migration changes the schema.

## Schema summary

- **`profiles`** — one row per `auth.users` row (`name`, `phone`, `town`,
  `account_type: user|dealer|admin`). Auto-created by a trigger on signup.
- **`listings`** — a bike for sale (`seller_id → profiles`, spec fields,
  `price_eur`, `status: active|sold|draft|removed`).
- **`listing_photos`** — `listing_id → listings`, `storage_path`, `sort_order`.
- **`saved_listings`** — `(profile_id, listing_id)` favourites, composite PK.
- **`dealer_requests`** — a user's request to become a dealer
  (`status: pending|approved|rejected`), approved only by an admin.
- Storage bucket **`listing-photos`** (private) — objects live at
  `{listing_id}/{filename}`.

## RLS approach

Every table has RLS enabled, no exceptions. The pattern throughout:

- **Owner-only writes.** Insert/update/delete policies check
  `seller_id`/`profile_id = (select auth.uid())` — never broader.
- **Public reads are scoped, not blanket.** `listings`/`listing_photos`
  are readable when `status = 'active'` OR the caller owns the row (so an
  owner can always see their own drafts). `profiles` has **no public
  select policy at all** — public read of `name`/`town`/`account_type`
  goes through the `public_profiles` **view** instead, which exposes only
  those columns and bypasses the base table's RLS by virtue of being a
  plain (non-`security_invoker`) view. Never add a broad `select` policy
  to `profiles` directly — that would defeat the view's purpose. The
  Supabase linter flags this view as `security_definer_view` (ERROR) —
  that's expected and correct; it's exactly this bypass that makes the
  view work, and it only ever exposes the three safe columns above.
- **Role checks use a `security definer` function**, not inline
  subqueries. `private.is_admin()` is the one example (gates the `update`
  policy on `dealer_requests`) — checking a role by directly subquerying
  `profiles` from another table's policy is the standard way to hit RLS
  recursion/perf issues; the security-definer function sidesteps that.
  It lives in a **`private` schema** (not `public`) specifically so
  PostgREST never auto-exposes it as a callable `/rest/v1/rpc/is_admin`
  endpoint — `authenticated`/`anon` have `USAGE`/`EXECUTE` on it so the
  RLS policy check still works, but nothing can call it directly.
- **Storage RLS mirrors table RLS.** `storage.objects` policies for the
  `listing-photos` bucket re-derive the listing from
  `storage.foldername(name)[1]` and apply the exact same
  active-or-owner / owner-only logic as `listing_photos`. The bucket is
  **private** — a public bucket serves any object to anyone with the URL
  and skips RLS entirely, which would leak draft-listing photos.
- All policies wrap `auth.uid()` as `(select auth.uid())` — current
  Supabase guidance, lets the planner evaluate it once per statement
  instead of once per row.

Migrations are applied via the Supabase MCP tools and mirrored as SQL
files in `supabase/migrations/` for version control — that folder is the
source of truth for schema history even though there's no local Supabase
CLI in the loop.

## Brand direction

**Punk/rock, not premium-fintech.** Primary: black + gold. Secondary:
red + grey. Bold condensed display type, high contrast, deliberately
rougher than a typical SaaS look — see the static demo's design system
(`index.html` et al. still in this repo's history) for the fully realized
version. Auth pages in this pass use a plain black/amber Tailwind
treatment as a placeholder, not the final visual system.

## Mobile-readiness principle

**All Supabase reads/writes live in `src/lib/data/*.ts` as plain
functions that take a `SupabaseClient<Database>` as their first
argument.** Nothing in that folder imports from `next/*` — no `cookies()`,
no `redirect()`, no `next/navigation`. Next.js pages, Server Actions, and
Route Handlers are a thin adapter layer: they construct the right client
(`src/lib/supabase/{client,server}.ts`) and call into `src/lib/data/`.

The point: when this becomes a React Native app, `src/lib/data/` ports
over unchanged. Only the client-construction layer gets swapped for
`supabase-js`'s React Native client setup (AsyncStorage-backed session
storage instead of cookies). If you're about to write a Supabase query
directly inside a page component or Server Action, stop — put it in
`src/lib/data/` instead, even if it's only called from one place today.

## Auth

Email/password via Supabase Auth (`/login`, `/signup`,
`src/app/actions/auth.ts`). `src/proxy.ts` (Next.js 16 renamed
`middleware.ts` → `proxy.ts`) refreshes the session cookie on every
request — this is an **optimistic check only**, per Next's own guidance;
the real authorization boundary is Postgres RLS, not the proxy.
