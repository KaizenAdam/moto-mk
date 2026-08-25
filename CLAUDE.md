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
  `price_eur`, `status: pending|active|sold|draft|removed|rejected`,
  **defaults to `pending`** — new listings sit in a moderation queue and
  only an admin can move one to `active` (enforced by a trigger, not just
  a policy — see below).
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
  subqueries. `private.is_admin()` gates the admin half of the `listings`
  and `dealer_requests` update policies — checking a role by directly
  subquerying `profiles` from another table's policy is the standard way
  to hit RLS recursion/perf issues; the security-definer function
  sidesteps that. It lives in a **`private` schema** (not `public`)
  specifically so PostgREST never auto-exposes it as a callable
  `/rest/v1/rpc/is_admin` endpoint — `authenticated`/`anon` have
  `USAGE`/`EXECUTE` on it so the RLS policy check still works, but
  nothing can call it directly.
- **Owner-or-admin is one policy, not two.** `listings_read`,
  `listings_update`, and `dealer_requests_select` each read
  `owner_condition OR private.is_admin()` in a single permissive policy.
  Two separate policies (one owner, one admin) are logically equivalent
  but make Postgres evaluate both per row — the linter flags this as
  `multiple_permissive_policies`. Keep it merged.
- **A permission an admin needs must exist as a SELECT policy too, or
  it's dead.** Postgres requires a row to be visible under some SELECT
  policy before UPDATE/DELETE can target it at all — an UPDATE policy
  alone is not enough. This bit twice during verification: `is_admin()`
  correctly gated the `dealer_requests` and `listings` UPDATE policies,
  but with no matching SELECT policy an admin's UPDATE silently matched
  zero rows, because `dealer_requests_owner_select`/`listings_read`
  (pre-fix) only covered the requester's/seller's own rows. Whenever you
  add an admin (or any non-owner) write policy, check whether the
  matching read policy needs the same `OR private.is_admin()` clause —
  including on any table whose visibility derives from the one you just
  changed (`listing_photos` needed it too, once `listings` did).
- **Status transitions an admin must gate go in a trigger, not just a
  policy.** RLS policies control *whether a row can be touched at all*;
  they can't cheaply express "this UPDATE is fine except when it changes
  this one column to this one value." `enforce_listing_activation()` is a
  single `before insert or update` trigger that raises an exception if
  `new.status = 'active'`, the caller isn't `private.is_admin()`, and
  either it's an `insert` or the row's status is actually changing
  (`tg_op = 'INSERT' or old.status is distinct from new.status` — the
  `tg_op` check short-circuits before `OLD` is referenced, since `OLD`
  doesn't exist on insert). One function covers both paths rather than
  duplicating the check: a seller can freely edit their own pending
  listing (price, description, etc.) or create a new one, but setting
  `status: 'active'` themselves — at insert or update — is a hard error,
  not a silently-ignored no-op or a quietly-coerced value.
- **Storage RLS mirrors table RLS.** `storage.objects` policies for the
  `listing-photos` bucket re-derive the listing from
  `storage.foldername(name)[1]` and apply the exact same
  active-or-owner-or-admin / owner-only logic as `listing_photos`. The
  bucket is **private** — a public bucket serves any object to anyone
  with the URL and skips RLS entirely, which would leak draft-listing
  photos. (The storage read policy originally shipped without the
  `OR private.is_admin()` arm that the table-row policy already had —
  an admin could see a pending listing had photos but not load the
  bytes. Fixed in `fix_listing_photos_storage_admin_read`; same bug
  class as the two SELECT-visibility issues above, just one layer
  further out.)
- **Private-bucket photos are served via signed URLs, generated
  server-side per request.** A private bucket has no public URL to link
  to, so `src/lib/data/listingPhotos.ts` exchanges each row's
  `storage_path` for a `createSignedUrl`/`createSignedUrls` (batched,
  not one call per photo) result — this still goes through the same
  Storage RLS as everything else, it just also hands back a time-boxed
  token (1 hour) alongside the URL. Pages render these as plain `<img>`
  tags (not `next/image` — the URL's token rotates every request, so
  it's not a stable optimization target).
- All policies wrap `auth.uid()` as `(select auth.uid())` — current
  Supabase guidance, lets the planner evaluate it once per statement
  instead of once per row.

Migrations are applied via the Supabase MCP tools and mirrored as SQL
files in `supabase/migrations/` for version control — that folder is the
source of truth for schema history even though there's no local Supabase
CLI in the loop.

## Seed content

The live database has 24 real listings + photos, ported from the static
demo's mock `listings` array (`index.html`) and its `images/listings/`
photos, all owned by one seed account — `demo-seller@example.test` /
profile name **"Just5Up Demo"**. This is real, permanent data in the
live project (not test-user scaffolding that gets cleaned up), so it's
safe to treat as a normal seller when testing — don't delete it as
leftover test residue. It was inserted as `status: 'active'` by
temporarily flipping the account to `admin` for the insert (bypassing
`enforce_listing_activation` legitimately, the same way an admin
approving a real submission would) and flipping it back to `user`
immediately after — it has no standing admin privileges.

## Brand direction

**Punk/rock, not premium-fintech.** Primary: black + gold. Secondary:
red + grey. Bold condensed display type, high contrast, deliberately
rougher than a typical SaaS look. The static demo (`index.html`,
`sell.html`, still at the repo root) is the approved reference design —
its palette and component vocabulary now live for real in
`src/app/globals.css` (`--black`/`--panel`/`--panel2`/`--line`/`--gold`/
`--gold-bright`/`--red`/`--grey`/`--text`/`--text-dim`, mirrored into
`@theme inline` as `bg-panel`/`text-gold`/etc. Tailwind utilities) and in
shared components: `SiteHeader`/`SiteFooter` (wrapped around every route
in `layout.tsx`), `ListingCard` (the `.card` unit — photo placeholder,
save-heart badge, spec chips, price), and `SaveButton`'s `badge`/`inline`
variants. Body font is the demo's system stack; the `.font-display`
class gives headings the demo's Georgia serif. Every real page
(`/`, `/listings`, `/listings/[id]`, `/sell`, `/login`, `/signup`) now
uses this system — the old ad-hoc black/amber Tailwind on the auth pages
is gone.

Two things the demo has that were deliberately **not** ported: the MK/SQ
language switcher (decorative in the demo — real i18n would mean
authoring and maintaining actual translated copy, a separate piece of
work) and the FEATURED/NEW card badges (mock-data flourishes with no
backing column in the real schema). The EUR/MKD currency toggle **was**
ported, since it's pure client-side math on the real `price_eur` value,
not decoration. `/listings` also gained working free-text search
(`search` param on `listActiveFiltered`, `.ilike` across
title/make/model) and sort (`sort` param), both small additive pieces
needed for real parity with the demo's search bar and sort dropdown.

`/sell` is now gated server-side (`redirect('/login')` if there's no
session) rather than only failing at submit time — it's the one real
protected page in the app now, so it got the redirect-to-login guard
that was previously deferred as unnecessary.

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

## Pages

- **`/listings`** — public browse page. Server Component, reads filters
  from `searchParams` (`make`, `style`, `engineType`, `town`, `priceMax`,
  `ccMax`) and calls `listActiveFiltered`/`listFilterOptions` in
  `src/lib/data/listings.ts` — a real server-side refetch per filter
  change, not client-side array filtering. `make`/`town` options are
  derived from real data; riding style and engine type come from the
  fixed lists in `src/lib/constants/listings.ts`. Engine type values are
  the schema's real `2-stroke`/`4-stroke`/`electric` — not the `2T`/`4T`
  shorthand the original static HTML demo (`index.html`, still in this
  repo's git history) used. There's no licence-category filter — the
  static demo dropped it earlier ("they don't have those licences in
  Macedonia") and this page follows that call, not the schema's original
  full field list.
- **`/listings/[id]`** — detail page, `getById` (RLS already scopes this
  to active-or-owner-or-admin).
- **`/sell`** — list-a-bike form. `createListingAction`
  (`src/app/actions/listings.ts`) never accepts a `status` field from the
  client — `create()`'s type signature omits it entirely, so the DB
  default (`pending`) is structurally the only possible outcome. On
  success the form is replaced with a "pending review" message, not a
  "you're live" one.
- **`/admin`** — pending-listing and pending-dealer-request review queue.
  Gated on `profiles.account_type === 'admin'` — this check is a UX
  nicety, not the security boundary; `listPendingForAdmin` in
  `listings.ts`/`dealerRequests.ts` and the approve/reject actions in
  `src/app/actions/admin.ts` are safe to call regardless, because RLS
  (`OR private.is_admin()`) is what actually filters/blocks a non-admin.
  Deliberately unstyled/unpaginated — a working tool, not a client-facing
  page.

## Testing real auth flows locally

Manually-inserted `auth.users` rows (for role/JWT-claim RLS testing, or
for a real `signInWithPassword()` walkthrough) need their token columns
(`confirmation_token`, `recovery_token`, `email_change`,
`email_change_token_new`, `email_change_token_current`, `phone_change`,
`phone_change_token`, `reauthentication_token`) set to `''`, not left
`NULL`. GoTrue's Go structs scan these as non-nullable strings — a `NULL`
row fails login with an opaque "Database error querying schema" that has
nothing to do with the password or RLS. Only surfaces once you test a
*real* login instead of the role-simulation approach used for RLS
verification.
