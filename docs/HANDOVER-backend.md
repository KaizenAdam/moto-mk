# Backend handover: featured listings, ads and payments

**For Adam (and Adam's Claude). Read this before starting backend work.**
Written 13 Oct 2026, after a front-end pass by Billy. That pass made no
database changes and had no Supabase access, so everything below the UI is
still to do. `CLAUDE.md` has the rest of the project's rules; nothing here
overrides them.

## What changed on the front end (Oct 2026)

| Area | Where | Notes |
|---|---|---|
| Landing hub | `/` (`src/app/page.tsx` fetches, `src/app/_home/HomeView.tsx` renders) | Hero search, browse by type, latest bikes, ad slot, parts/events/service centres/forum, dealers, sell banner |
| Bike search | **moved to `/bikes`** (`src/app/bikes/page.tsx`) | `/listings?…` redirects here with its filters. Top filter bar kept (your 25 Aug call). |
| Result cards | `src/app/components/ListingCard.tsx` | Bikesales-style: photo count, spec icons, dealer/private line, Contact / View details |
| Listing page | `src/app/listings/[id]/` (`page.tsx` fetches, `ListingView.tsx` renders) | Auto Trader-style: photo mosaic + full-screen gallery, sticky contact card, sticky Call/WhatsApp bar on phones, similar bikes. Contact rules unchanged (now in `resolveContact()` in `ContactSeller.tsx`). |
| Feature your bike | `/listings/[id]/feature` | Owner-only package picker. **"Continue to payment" is disabled.** Linked from My Garage. |
| Advertise | `/advertise` | Ad slots, how booking works. **"Enquire" is disabled**, because there's no contact address yet. |
| Ad slots | `src/app/components/AdSlot.tsx` | Home banner, results banner (after 12 bikes), listing sidebar. They all show a house "Your ad here" card for now. |

New read-only data functions are in `src/lib/data/listings.ts`: `listLatest`, `listStyleShowcase`, `listSimilar`. `getCoverPhotos` in `listingPhotos.ts` now returns photo counts too.

## The UI contracts the backend has to fill

1. **`ListingCard`'s `featured` prop.** It draws a gold frame and a "Featured" badge.
   - Nothing passes `true` yet.
   - **Only pass it for a listing that is really featured right now.** The live site is client-facing, and a fake badge would mislead buyers.
2. **Home page row.** `page.tsx` passes `latestAreFeatured={false}` and the newest 8 bikes.
   - Once featured listings exist, fetch the live featured ones (and top up with the newest if there are fewer than 8).
   - Then set `latestAreFeatured` and per-card `featured`.
3. **Search order** (`listActiveFiltered`). For "Newest first", put featured listings first (`featured_until > now()`), then the most recently bumped, then the newest.
   - Keep the `id` tie-breaker so paging stays stable.
   - Also pass `featured` to the cards. `ListingsGrid` takes per-listing data, so add a set of featured ids alongside `dealerNames`.
4. **`AdSlot`** takes `slot` (`home-banner` | `results-inline` | `listing-sidebar`) and an optional `ad: { imageUrl, href, advertiser }`.
   - Fetch the live ad for each slot on those three pages and pass it in.
   - When there's no ad, the house card shows, which is correct.
5. **`src/lib/constants/monetisation.ts`** is the one definition of the packages (`bump`, `featured-7`, `featured-30`, with `days`) and the slots.
   - Prices are `null`, shown as "Price TBC" until the client sets them.
   - Charge from these ids; don't redefine them.
6. **The two disabled buttons.**
   - Feature page: `FeatureForm.tsx`, "Continue to payment".
   - Advertise page: `advertise/page.tsx`, "Enquire".
   - Wire them to the checkout below, or to an enquiry address once the client gives one.

## Suggested schema (follow the CLAUDE.md RLS rules)

- **`listings`:**
  - Add `featured_until timestamptz null` and `bumped_at timestamptz null`.
  - **Users must not be able to write either. Today they could.** `listings` has no column grants: `authenticated` keeps Supabase's table-wide default privileges, and `listings_update` lets an owner update any column of their own row. So a new `featured_until` would let a seller feature their own bike for free.
    - Either revoke `update` and grant it back only on the seller-editable columns, as `profiles` and `dealers` do. The sell and edit forms write `title`, `make`, `model`, `price_eur`, `year`, `engine_cc`, `engine_type`, `riding_style`, `mileage_km`, `town`, `description`, `licence_category`, `status` and `rejection_reason`. `status` is already guarded by `enforce_listing_activation()`.
    - Or extend that trigger so a non-admin changing `featured_until` or `bumped_at` raises.
    - Then test by attempting the write as `authenticated`.
  - **Keep both out of `require_rereview_on_edit()`.** A payment shouldn't send a live bike back to review.
  - Add an index for the sort.
- **`ads`** table:
  - Columns: `id`, `slot` (check constraint on the three ids), `advertiser`, `image_path`, `href` (must be `https://`), `starts_at`, `ends_at`, `active`, `created_at`.
  - Public read only when `active and now() between starts_at and ends_at`, written as one permissive policy with `OR private.is_admin()` for the admin list.
  - Admin-only writes.
  - `revoke all` first (new-table default privileges).
  - Public **`ad-images`** bucket. Ads are public by nature, unlike `listing-photos`.
- **`payments`** table (audit trail):
  - Columns: `listing_id` / `ad_id`, `package_id`, `amount`, `currency`, `provider`, `provider_ref` (unique, for idempotent webhooks), `status`, `created_at`.
  - Owner can read their own; admin can read all; no user writes.

## Payments

- **Flow:** the feature page creates a checkout session (server action or route handler) for the chosen package and listing, then the provider's hosted checkout runs, then a **webhook route handler** marks the payment paid and sets `featured_until = greatest(now(), featured_until) + days`, or sets `bumped_at = now()`. Never trust the success redirect alone.
- **Privilege:** the project has **no service-role key, by design**, and the webhook has no user session. Pick one:
  - (a) A `security definer` function, e.g. `private.apply_payment(...)`, exposed only through a public wrapper that checks a shared secret. Keep it out of PostgREST's reach the way `is_admin()` is.
  - (b) Add a service-role key as a Vercel secret, used only in the webhook route.
  
  Either way, the webhook must verify the provider's signature and be idempotent on `provider_ref`.
- **Provider:** depends on the open question of **which entity contracts: UK or North Macedonian.**
  - Stripe works for a UK entity.
  - Check whether it supports a North Macedonian one before assuming it does. If it doesn't, look at local card acquirers.
  - The handover's agreed scope said "no in-app payments in Phase 1". Billy has since asked for this to be planned now, so confirm the phase and budget with the client.
- **Admin portal:** add "Feature this listing until…" (manual, for payments taken off-site), an ads manager (upload, slot, dates, on/off) and a payments list.

## Parts & Gear (second front-end pass, 14 Oct 2026)

`/parts-gear` is a finished page shell with nothing to list yet:
- **Categories:** the client's two categories, with sub-category tiles from `src/lib/constants/parts.ts` (`PART_CATEGORIES`, `PART_CONDITIONS`). Store these ids; don't redefine them.
- **Not wired up yet:** the brand search and "Sell parts & gear" are disabled. Every tile shows "No listings yet".
- **Card:** `src/app/components/PartCard.tsx` is ready and typed (`PartCardData`), but nothing renders it until parts exist. It links to `/parts-gear/[id]`, a detail page that doesn't exist yet.

Suggested backend, following the listings pattern:
- A **`parts`** table:
  - `seller_id → profiles` (the brief says parts sit under the same profile as the seller's bikes)
  - `category`, `subcategory`, `brand`, `title`, `description`, `condition`, `price_eur`, `town`
  - `status` defaulting to `pending`, with the same `enforce_listing_activation`-style trigger and re-review-on-edit rules
- A **`part_photos`** table and a private bucket, mirroring `listing_photos` and its Storage RLS.
- **Front end still to do:**
  - fill the tiles with live counts
  - a results grid of `PartCard`s per subcategory, plus brand search
  - a sell-a-part form (reuse `PhotoPicker`)
  - a detail page, reusing `ListingView`'s layout and `ContactSeller` rules
  - a "Parts" section in My Garage and the admin review queue

## Smaller future items from the same pass
- **Event submissions:** `/events` says the team adds events for now. A public "submit an event" form would need a `pending` status on `events` and an admin queue.
- **Admin users table:** still unpaginated. The new filter box only searches rows already fetched.
- **The sell form is four steps,** but it's still one `<form>` posting the same fields to `createListingAction` as before. Nothing changed on the server side.

## Known issues found during the front-end pass

- **Vercel Preview deployments have no Supabase env vars.** Every preview returns a bare "Internal Server Error". Tick **Preview** on `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` if set) under Project → Settings → Environment Variables, then redeploy.
- **`src/lib/supabase/proxy.ts` throws when those env vars are missing**, because `createServerClient` runs outside the `try`. That's why the failure is a bare 500 instead of the branded error page. Consider failing soft.
- **`createListingAction` (`src/app/actions/listings.ts`) still calls `supabase.auth.getUser()`**, which goes against the `getCurrentUser()` rule in `CLAUDE.md`.
- **`listStyleShowcase` reads one narrow row per live listing.** That's fine now; make it a grouped view or RPC once there are thousands of listings.
- **Billy Monsey's approved dealer request predates the approval trigger**, so his profile is still `user` and he has no storefront (see `CLAUDE.md`, Seed content). Decide whether to re-run the approval.

## Open questions for the client

- Package prices (bump, 7 days, 30 days) and ad prices per slot.
- Contact address for advertising enquiries (and the footer's legal links).
- Licence category filter: keep or drop? Their brief asks for it; it was removed on 25 Aug.
- Forum: it's Phase 3 in the quote, but it's in their nav. The hub shows it as "Coming soon" for now.
- Which entity contracts (UK or North Macedonian)? This decides the payment provider.
