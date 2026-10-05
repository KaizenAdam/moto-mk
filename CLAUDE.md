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
- **`events`** — admin-authored marketing content (`title`, `description`,
  `event_date`, `location`, `created_by → profiles`). No moderation
  lifecycle like listings — public read, admin-only write. Managed from
  `/admin` (create/delete), shown publicly at `/events`.
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
  changed (`listing_photos` needed it too, once `listings` did — and its
  own Storage-layer read policy needed the same fix separately, since
  `storage.objects` policies are independent of the table-row policies
  they parallel). `profiles` went the longest without this: it had no
  admin arm at all until the admin portal needed one (`profiles_select`),
  because nothing before that ever needed an admin to see another user's
  full row.
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
- **Editing a live listing sends it back to review.** A non-admin
  change to any descriptive column of an `active` listing flips it to
  `pending` (`require_rereview_on_edit()`), and so does adding or
  replacing a photo (`require_rereview_on_photo_change()`). Price is
  exempt on purpose. **When you add a column a buyer reads (e.g. a
  description), add it to that trigger's column list**, or sellers can
  change it after approval unseen. Rejecting sets `rejection_reason`,
  which the seller sees on their listing page; approving clears it.
- **Check constraints back the sell form:** price > 0, year 1900–2100,
  mileage and engine size ≥ 0. The photo bucket takes JPEG/PNG/WebP/AVIF
  only, 10 MB max.
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
CLI in the loop. If `apply_migration` times out (it does on statements
the tool wants confirmed, like `drop policy`), run the SQL with
`execute_sql`, prefer `alter policy` over drop/create, and insert the
version row into `supabase_migrations.schema_migrations` yourself so the
file name and the database agree.

- **Column-level grants guard columns users must never write.**
  `profiles` allows `authenticated` to update only `name`, `phone`,
  `town`. A row-level "owner can update" policy covers every column, so
  before this (fixed 2 Oct 2026) any user could set their own
  `account_type` to `admin`. When you add a column a user must not
  control, leave it out of the grant. `account_type` changes only in
  security-definer code: approving a `dealer_requests` row makes the user
  a dealer (`apply_dealer_request_decision()` trigger), and new requests
  must be inserted as `pending`.
- **A new table starts with ALL privileges for `anon` and
  `authenticated`** (Supabase's default privileges). A column-level
  `grant update (a, b)` on its own changes nothing — the table-wide grant
  still allows every column. Always `revoke all ... from anon,
  authenticated` first, then grant exactly what's needed. Found when a
  dealer could rewrite their own storefront `slug` and `active` flag
  despite a column grant; `dealers` now does it properly. Test column
  restrictions by actually attempting the write as the role.
- **Dealer storefronts (`dealers`).** One row per dealer, created by
  the same approval trigger (slug from `private.slugify()`, which
  transliterates Macedonian Cyrillic; `-2`, `-3` on clashes). Revoking
  an approval sets `active = false` and keeps the row, so edits survive
  re-approval. Public read when active. Dealers edit only
  `business_name`, `town`, `address`, `phone`, `about` — never `slug` or
  `active`. Users can't insert rows. The shop `phone` is public by
  design, unlike a profile phone.

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

Two plain profiles also exist for client-demo purposes — **Adam Harvey**
(`adam@kaizensolutionsuk.com` — a real inbox, switched from the initial
`adam.harvey@example.test` placeholder so it's a usable login for the
demo; now `account_type: 'admin'`, so this is also the real admin login
for `/admin`) and **Billy Monsey** (`billy.monsey@example.test`,
`account_type: 'user'`). Neither has listings of their own.

**Never write a password, key or token into this repo.** It is public on
GitHub. The demo passwords used to be listed here, which meant the real
admin login was public; they were rotated on 2 Oct 2026 and are kept
outside the repo. Real permanent rows, not test residue — don't
delete them either.

For a client walkthrough, the admin portal was also seeded with
in-progress-looking state: 3 of "Just5Up Demo"'s listings (the Honda
CBR500R, KTM 390 Duke, and Yamaha YBR 125) are `status: 'pending'`
rather than `active`, so the pending-listings queue isn't empty. Two
more real accounts exist as approved dealers — **Elena Petrova**
(`elena.petrova@example.test`, Skopje Moto Garage) and **Goran
Ivanovski** (`goran.ivanovski@example.test`, Ohrid Bike Centre) — each
with a matching `approved` `dealer_requests` row for their business
name. Each dealer has 4 of the demo bikes moved to them (same towns),
and a demo "about" text. Billy Monsey's `dealer_requests` row ("Monsey Motorcycles") was
seeded *pending* but has since been approved, before approval updated
`account_type`, so his profile is still `user`. All real, permanent
demo state — not test residue to clean up.

## UI building blocks (Oct 2026 polish pass)

- **Shared styles: `src/app/components/ui.ts`.** `button(variant, size)`
  (primary / outline / danger / success / whatsapp × sm / md / lg),
  `input`, `label`, `sectionTitle`, `card`, `errorBox`, `heroBackground`.
  Use these instead of writing button or input classes inline; every page
  and the admin portal now do.
- **Header:** `SiteHeader` + `NavLinks` (current section highlighted) +
  `MobileMenu` (☰ below `lg`). Nav items live in `NAV_ITEMS` in
  `NavLinks.tsx`. "Parts & Gear" is out of the nav until it's built (the
  route still exists).
- **Toasts:** `toast("Saved")` from any client component
  (`components/Toaster.tsx`, mounted once in the root layout). For
  successes only; errors stay next to what failed.
  `ActionButton` takes `successMessage`.
- **`not-found.tsx`** and **`SiteFooter`** are branded. Legal links
  (privacy, terms) and a contact email go in the footer once the client
  supplies the details.
- **Brand images:** `public/brand/*.svg` are huge raster-in-SVG originals
  (1 MB / 650 KB). The site uses pre-sized PNGs made from them with sharp:
  `wordmark-white.png` (621×168) and `icon-gold-{32,180,512}.png`. Don't
  reference the SVGs from pages.
- **Share previews:** `metadataBase` comes from `SITE_URL` in
  `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL`, else Vercel's production
  URL). Page titles use the layout template (`%s — Just5Up!`), so don't
  add the suffix yourself. `app/opengraph-image.tsx` is the default card.
  `app/listings/[id]/opengraph-image.tsx` renders the bike's photo,
  price and town, fetched as anon so only live listings get one. Listing
  pages set their own title/description, and non-live ones are `noindex`.
- **Browse paging:** `BROWSE_PAGE_SIZE` (24) in `listings.ts`;
  `listActiveFiltered` returns `{ listings, total }`. `?page=` is dropped
  whenever a filter or sort changes (`withParam`).

## Brand direction

**Punk/rock, not premium-fintech.** Primary: black + gold. Secondary:
red + grey. Bold condensed display type, high contrast, deliberately
rougher than a typical SaaS look. The static demo (`index.html`,
`sell.html`; removed from the tree on 2 Oct 2026, still in git history
up to commit `86c068b`) is the approved reference design —
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

**"Who's logged in" is `getCurrentUser()` in `src/lib/data/auth.ts`**,
returning `{ id }` or null. It uses `auth.getClaims()`, which verifies the
session JWT's signature locally against the project's signing keys, not
`getUser()` (a network round trip to Supabase Auth per call) and never
`getSession()` (reads the cookie unverified). The proxy uses `getClaims()`
too. This only decides what to show; RLS re-checks the JWT on every
query. It's `React.cache()`-wrapped (a plain `react` import, not
`next/*`), so several data functions in one render share one check.
Every `src/lib/data/*` function that needs the user must call it rather
than touching `supabase.auth` directly. Independent fetches in a page go
in one `Promise.all(...)`; only genuinely dependent ones (signing photo
URLs needs the listing ids) run after.

**Speed checklist (from the Oct 2026 "every click is slow" pass).**
- **Vercel runs in `fra1`** (`vercel.json` `regions`), next to the
  Supabase project in `eu-central-1`. The default (Washington DC) put an
  Atlantic crossing on every query. Never remove it, and if the database
  ever moves, move this with it.
- **Every route has a `loading.tsx`** (shapes in
  `src/app/components/Skeletons.tsx`), so a click shows the page's
  outline at once. Add one with any new route.
- **Public photo URLs are cached** (`cachedPhotoSigner()` in
  `src/lib/photos/signer.ts`): signed as anon, reused for 50 minutes,
  so browsers can cache the images. Private photos (pending listings,
  admin review) are still signed fresh as the viewer. Use it on
  public-facing pages; the default signer is right for admin/edit pages.

**Currency display is pure client state, never a server round-trip.**
`ListingsGrid` (`src/app/components/ListingsGrid.tsx`) owns `currency`
locally — `formatPrice` (`src/lib/constants/listings.ts`) is pure
client-side math on an already-fetched price, so there is never a reason
to refetch from the server just to reformat a number. This used to be a
`cur` URL param that re-ran the whole page's data fetching on every
toggle — the single worst offender in the same latency complaint.

## Auth

Email/password via Supabase Auth (`/login`, `/signup`,
`src/app/actions/auth.ts`). `src/proxy.ts` (Next.js 16 renamed
`middleware.ts` → `proxy.ts`) refreshes the session cookie on every
request — this is an **optimistic check only**, per Next's own guidance;
the real authorization boundary is Postgres RLS, not the proxy.

Password reset: `/forgot-password` → email → `/auth/confirm` (swaps the
link's `code` or `token_hash` for a session) → `/reset-password`. Signup
confirmation links land on `/auth/confirm` too; with confirmation on,
signup shows "check your email" instead of redirecting. Email links
are built from `NEXT_PUBLIC_SITE_URL` (falling back to the request
origin), and **Supabase only follows them if `<site>/auth/confirm` is
on Auth → URL Configuration → Redirect URLs**. Minimum password length
is 8, checked in the server actions.

## Pages

- **`/` is the browse page** — matches the static demo, where
  `index.html` was always hero + filter bar + grid on one URL, never a
  separate marketing homepage. `/listings` (below) is a thin redirect to
  `/` that preserves query params, kept only for old links/bookmarks —
  the real implementation lives at `src/app/page.tsx`. The filter bar and
  results grid are intentionally **not** width-capped (no `max-w-*`
  wrapper) — only the header and hero text are, matching `index.html`'s
  `.layout`/`.filterbar` (full width) vs `.header-inner`/`.hero-inner`
  (capped at 1280px) split exactly. Don't reintroduce a `max-w-[1280px]`
  around the grid/filter bar — that was tried once during the design
  pass and had to be reverted.
- **Nav is the full 5-item menu** (Buy, Parts & Gear, Events, Service
  Centres, Dealers), matching the demo. `/parts-gear`, `/service-centres`,
  `/dealers` are still minimal `ComingSoon`-component pages (ported from
  the demo's own "Coming Soon" placeholder pages), not dead links.
  `/events` is real (see below). No mobile hamburger — the demo's own
  burger button was non-functional (CSS-only, no JS behind it); the nav
  just wraps on narrow screens instead.
- **`/events`** — public read via `listUpcoming` in
  `src/lib/data/events.ts`, which filters to `event_date >= today OR
  event_date IS NULL` (an `.or()` filter, since Postgrest has no single
  operator for "gte or null") — a past rally shouldn't linger at the top
  of a public events page. The admin portal's own list
  (`listEvents`) deliberately shows everything, past included, since
  managing old rows is a real admin need past events shouldn't need
  archiving to fix. No RLS beyond what already exists (`events_public_read`).
- **The browse page** (`/`, redirected to from `/listings`) — Server
  Component, reads filters from `searchParams` (`make`, `style`,
  `engineType`, `town`, `priceMax`, `ccMax`) and calls
  `listActiveFiltered`/`listFilterOptions` in `src/lib/data/listings.ts`
  — a real server-side refetch per filter change, not client-side array
  filtering. `make`/`town` options are derived from real data; riding
  style and engine type come from the fixed lists in
  `src/lib/constants/listings.ts`. Engine type values are the schema's
  real `2-stroke`/`4-stroke`/`electric` — not the `2T`/`4T` shorthand the
  original static HTML demo (`index.html`, still in this repo's git
  history) used. There's no licence-category filter — the static demo
  dropped it earlier ("they don't have those licences in Macedonia") and
  this page follows that call, not the schema's original full field list.
- **`/listings/[id]`** — detail page, `getById` (RLS already scopes this
  to active-or-owner-or-admin).
- **`/sell`** — list-a-bike form. `createListingAction`
  (`src/app/actions/listings.ts`) never accepts a `status` field from the
  client — `create()`'s type signature omits it entirely, so the DB
  default (`pending`) is structurally the only possible outcome. On
  success the form is replaced with a "pending review" message, not a
  "you're live" one. A phone number is required (saved to the profile).
  **Photos upload from the browser, after the listing is created**:
  `uploadListingPhotos()` (`src/app/components/uploadPhotos.ts`)
  compresses each to a ≤1600px JPEG (`src/lib/images/compress.ts`, which
  also strips EXIF/GPS) and calls `addPhotos()` in
  `src/lib/data/listingPhotos.ts`. They go direct to Storage because a
  server action's body is capped at 1 MB; Storage RLS still enforces
  ownership. Max 10 photos per listing (`MAX_PHOTOS`).
- **Contacting a seller** — the listing page shows WhatsApp and Call
  buttons to signed-in visitors only. The phone comes from the
  `get_seller_contact(listing_id)` security-definer RPC, executable by
  `authenticated` only, and only for a listing the caller can see. It is
  the one way a phone leaves `profiles` — don't add phone to
  `public_profiles` or a select policy. Numbers are normalised to
  international form (leading 0 → 389) in `src/lib/contact/phone.ts`.
- **`/garage`** ("My Garage") — the user's own listings with status,
  rejection reason, Edit / Mark sold / Delete; saved bikes; profile
  (name, phone, town); dealer-account request. **`/listings/[id]/edit`**
  edits details and adds/removes photos; saving a rejected listing
  resubmits it as pending. Deleting a listing removes its Storage files
  first (`remove()` in `listings.ts`) — the row cascade only removes
  `listing_photos` rows, never the files. Seller actions live in
  `src/app/actions/garage.ts`; ownership is RLS, not code.
- **`/dealers`** — directory of live storefronts, most stock first.
  **`/dealers/[slug]`** — a storefront: business details, public
  WhatsApp/Call to the shop line, Google Maps link for the address, and
  the dealer's live listings. Dealer listings carry a badge on cards
  (`dealerNames` into `ListingsGrid`), and their listing pages show the
  business, a storefront link and the shop line to everyone. Dealers
  edit their storefront from My Garage (`#storefront`).
- **`/service-centres`** — a map (Leaflet) beside a list of workshops,
  brand service centres and importers (`service_centres` table: public
  read, admin-only write). Pins come from `lat`/`lng`, which are **only
  ever set by an admin**: Admin → Service centres → "Locate all" looks
  up every unplaced centre (one request per second, Nominatim's limit;
  `src/lib/map/geocode.ts`) and shows the suggestions on one map to drag
  and save, or "Set location" does one centre. A town-only match can't be
  saved until its pin has been moved. Unplaced centres are listed under "Not on
  the map yet" — never pinned at a guessed spot. The one map component is
  `src/app/components/map/LeafletMap.tsx`; load it with `next/dynamic`
  and `{ ssr: false }` (Leaflet needs `window`). Pins are CSS (`.j5-pin`),
  not Leaflet's PNG markers. **Tiles default to OpenStreetMap's servers,
  which aren't meant for heavy commercial traffic** — before launch, set
  `NEXT_PUBLIC_MAP_TILE_URL` / `_ATTRIBUTION` to a key-based provider
  (see `src/lib/map/tiles.ts`). Filter by town (`?town=`); Call, plus
  WhatsApp only for mobile
  numbers (`canWhatsApp()` — MK landlines can't take WhatsApp), Google
  Maps link, website. **`verified`** means someone confirmed the
  details by phone or visit; unverified cards say "call ahead". The 8
  seed rows (5 Oct 2026) came from public directories (zk.mk,
  motori.com.mk, brand pages), each with its `source_url`. Fields where
  sources disagreed were left empty, not guessed. Coverage outside Skopje
  is thin — the admin portal has an add / verify / delete section.
  Motocentar (motocentar.com.mk) is a car-tyre chain, not a bike
  service: don't add it.
- **`/admin`** — the full admin portal: pending-listing and
  pending-dealer-request review queues, a roster of every user
  (`listAllForAdmin` in `profiles.ts` — needs the `profiles_select` admin
  RLS arm noted above), a dealers section (profiles where
  `account_type = 'dealer'`, cross-referenced against
  `listApprovedForAdmin` in `dealerRequests.ts` for each one's business
  name), and event create/delete (`src/lib/data/events.ts`). Gated on
  `profiles.account_type === 'admin'` — this check is a UX nicety, not
  the security boundary; every `*ForAdmin` function and admin action in
  `src/app/actions/admin.ts` is safe to call regardless, because RLS
  (`OR private.is_admin()`) is what actually filters/blocks a non-admin.
  The all-users table can't show email addresses — those live in
  `auth.users`, only reachable via the Admin API, and this project has no
  service-role key by design. Uses the same shared styles as the rest of
  the site (restyled Oct 2026); still unpaginated.

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
