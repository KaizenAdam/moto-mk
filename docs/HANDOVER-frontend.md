# Front-end handover: where the Oct–Nov 2026 design pass is up to

The front-end pass is Billy's work: UI and user journeys only, with
no schema changes. Anything that needs the database is in
`docs/HANDOVER-backend.md`, which Adam (or his Claude) should read before
backend work. `CLAUDE.md` holds the durable rules; this file is the
snapshot of progress and what's next.

Everything below is **live on `main`** (moto-mk.vercel.app). The last
release was `e6ba360` (the first-draft finish), on 4 Nov 2026.

## Done

**Foundations (early Oct)**
- **Type and components:** Oswald display type (`.font-display`) and the
  shared components and styles in `src/app/components/`: `ui.ts`,
  `PageHero`, `Badge`, `Chip`, `EmptyState`, `SectionHeading`, `AdSlot`,
  `EventDate`.
- **Navigation:** every section is in the nav, with a ☰ menu below `xl`.

**Pages**
- **Search:** moved to `/bikes`. `/listings?…` redirects there.
- **Listing page:** Auto Trader-style. It has:
  - a photo mosaic and a full-screen gallery
  - a sticky contact card, with Call/WhatsApp pinned to the bottom on
    phones
  - similar bikes
  - a fix so a single photo is shown whole, not cropped
- **Feature and advertise:** `/listings/[id]/feature` (feature your bike)
  and `/advertise` (ad slots, now part of `/for-business`). Both are front end only and their pay
  buttons are disabled until the backend exists.
- **Parts & Gear:** an honest page shell, with categories and empty
  states but no fake items.
- **Events:** a "Next up" feature, events grouped by month, and an
  `.ics` "Add to calendar" download.
- **Sell form:** four steps in one `<form>`, so the server action is
  unchanged. Photos can be dragged in, reordered and given a cover.
- **Admin portal:** restyled as a dashboard (counts, a section rail and a
  filterable users table).

**The new look (mid-Oct to 4 Nov)**
- **Home page:** design mock-ups were done on a Claude design canvas
  ("Just5Up! Home Mockups", a private artifact in Billy's account) over
  three rounds. Billy picked **R3 · Combo**, which is now the live home
  page (`src/app/_home/HomeView.tsx`):
  - a black-and-white hero photo with a torn edge, and search
  - angled "Browse by type" tiles
  - Latest bikes
  - the home ad banner
  - a red events and "Keep it rolling" band
  - a gold "Sell your bike today" banner
- **Colour jobs:**
  - flat `highlight` gold (`#f2c230`, in `globals.css`) for prices and
    buy/sell actions
  - red for riding and attention
  - square corners on the restyled pages
- **`Shard`:** the brand's one decorative shape, at most one per section.
  Billy found several busy.
- **Header and footer (every page):**
  - the current section is underlined in gold
  - "Log in" is a red outline and "Sell your bike >>>" is solid gold
  - the footer is dark grey `#1a1a1c`
- **Search page restyled:**
  - It keeps the glow hero, because the client likes it, plus one torn
    shard.
  - The search box is white.
  - Filters are square, with a gold edge on any filter that's set.
  - It's split into `page.tsx` (fetching) and `BikesView.tsx` (markup).
- **Listing page restyled:**
  - square gallery
  - gold price tag
  - overview tiles
  - contact card with a gold top edge
  - a red "Buying safely" block
- **`ListingCard`:** restyled square (gold price tag, red Contact / gold
  View bike). It's used on search, similar bikes, My Garage and the
  feature page.
- **Icons:** the hand-drawn SVG icons and text glyphs (♡ × ‹ ›) were
  replaced with **Tabler** (`@tabler/icons-react`, version pinned in
  `package.json`). They're wrapped in `src/app/components/icons.tsx`
  under the old names. Add new icons there; don't hand-draw any.

**First draft finished (4 Nov 2026)**
- **Every remaining page now has the new look:** dealers and storefronts,
  events, service centres, parts & gear, sell and edit, My Garage,
  advertise and feature, admin, and the auth pages.
- **It was done at the source, in `ui.ts`:** `button()`, `input`, `card`,
  `errorBox` and `sectionTitle` are square now. `primary` is flat
  `highlight` gold, `outline` is the red outline and `danger` is red text
  in a red outline. `SectionHeading` is a plain Oswald h2, and `Badge`, the
  AdSlot house card, `EmptyState`, `Chip`, `EventDate` and the toast are
  square. New pages should just use `ui.ts`.
- **Accents:** leftover `gold` accents on those pages are now `highlight`
  (including `PinIcon`). The gradient call-to-action panels (advertise,
  parts & gear) have a gold top edge, and the events "Next up" card has a
  red one.
- **Alignment:** `PageHero` pads its inner column, so hero titles line up
  with the header logo and the page content.
- **Back links and photo-order buttons** use Tabler arrows, not ← → glyphs.
- **Skeletons:** the home and search pages have their own
  (`HomeSkeleton`, `SearchSkeleton`) matching the new layouts.

**Home-page look carried into Events, Dealers and Parts & Gear (4 Nov 2026)**
- Billy's favourite thing about the home page is how it breaks up the
  black: red bands, gold blocks and the odd torn shard. The shared pieces
  for that are in `src/app/components/Bands.tsx`:
  - `BlockHero`: a black hero with a gold-block word (`HighlightWord`),
    red ticks and room for a white search box
  - `RedBand`: a full-width red band
  - `GoldBanner`: the gold "Sell your bike today" banner
  - `blackButton`: the black button with a red outline used on red and gold
- **Events** has a search box, a place filter and When (any time, this
  month, next 3 months, date TBC). The filters run in the browser, since
  the page already has every upcoming event. The next event gets a red
  band, and the rest are full-width rows grouped by month.
- **Dealers** has dealer cards with a gold initial block, a town filter
  (`?town=`), and a red "Run a dealership?" band linking to
  `/for-business#dealers`.
- **Parts & Gear** has angled category tiles like the home page's Browse
  by type, a red "How it'll work" band and a gold banner.
- **Service Centres** got the same treatment, keeping the glow gradient
  the client likes (`BlockHero gradient`): "Find a workshop" with real
  counts in the ticks, gold town filters, centre cards with a red left
  edge, and a red "Run a workshop?" band linking to
  `/for-business#service`.
- **For business** too, also keeping the gradient: "Grow your business"
  with the three routes as dark tiles in the hero, red-edged dealer perks,
  advertising in a red band, and "Ad booking opens soon" as a gold banner
  with the disabled Enquire button.
- **Then every remaining page (4 Nov):**
  - My Garage: "Billy's garage" hero with live/review/saved counts, gold
    or red edged listing rows, and the dealer request or storefront form
    in a red band
  - Sell, Edit, Feature and the `/feature` picker: `BlockHero compact`
    (Sell keeps the gradient)
  - dealer storefronts: the business name in a gold block, gradient kept
  - Admin: the counts as tiles in a gradient hero, gold when something's
    waiting
  - log in, sign up, forgot and reset password: `AuthShell`, a big line
    on the left and the form on the right
- The home page itself is unchanged.
- **No two heroes share a shard placement.** `BlockHero` requires a
  `shard` prop. Each page varies the home page's `double` chevrons and
  `bent` shard by position, size, rotation and tint:
  - Events: red chevrons in the hero, bent in its band
  - Dealers: a mirrored gold bent shard, and mirrored chevrons in the band
  - Parts & Gear: a red `fang` running off the bottom of the hero,
    chevrons in its band, and `claw` on its gold banner (Billy kept that)

  The first attempt used a lightning bolt and claw slashes in heroes;
  Billy said they weren't the brand's style.

**Pre-demo fixes (4 Nov 2026, Billy's list)**
- Every em and en dash in visible copy is now a hyphen (" - "), site-wide.
- Home: "no junk" dropped from the hero ticks; the Browse by type tiles
  have no counts.
- Buy: a new red chevron shard in the hero (`PageHero` now takes a
  shard spec like `BlockHero`).
- A cookies & preferred-language bar on first visit (`CookieBar`), which
  the footer can reopen.
- Parts & Gear: greyed photos on every tile instead of spanner/helmet
  icons (`public/parts/`).
- Dealers: a shop-front photo slot on cards and storefronts, showing a
  "coming soon" placeholder until uploads exist (backend handover).

**Pre-launch check (4 Nov 2026)**
- Fixed: the default Next.js favicon; missing robots.txt and sitemap;
  generic titles on log in, sign up, password and 404 pages; missing
  security headers; unlabelled filter dropdowns on /bikes; invalid spec
  list markup on listing pages; unnamed map pins on /service-centres.
- Still to do before launch:
  - **update the placeholders before launch:** the footer email
    (`hello@just5up.mk`, `CONTACT_EMAIL` in `src/lib/site.ts`) and the
    [bracketed] gaps in the draft `/privacy` and `/terms` templates
    (company name, address, registration number, governing law, minimum
    age, log retention), then a lawyer's review and `draft={false}`
  - a key-based map tile provider (`NEXT_PUBLIC_MAP_TILE_URL`)
  - the real domain: set `NEXT_PUBLIC_SITE_URL` and add
    `<domain>/auth/confirm` to Supabase's Redirect URLs
  - Preview env vars on Vercel (`docs/HANDOVER-backend.md`)
  - Skopje Moto Garage's "about" text has an en dash ("Mon–Sat"); it's
    dealer-written data, editable from that dealer's My Garage

**Waiting on the client:** a contact email or phone for business
enquiries, so the For business page's "Enquire" button can work. It's
listed in `docs/HANDOVER-backend.md`.

## Not checked yet

- **Real accounts on the live site.** The signed-in views were checked
  against sample data, not real accounts. Those views are a private
  seller's Call/WhatsApp, your own listing, saved hearts, the garage, sell,
  edit, feature and admin. A quick click-through after the deploy is still
  worth doing.
- **Uploading photos and submitting forms** weren't exercised (the stand-in
  only echoes writes).

## How the work was checked (for whoever picks this up)

**Vercel previews don't work:** they lack the Supabase environment
variables and return a bare 500. So the team pushes to `main` once Billy
has seen screenshots.

**Local check (signed-in views too):** the 4 Nov pass used a small
throwaway stand-in for Supabase (a Node HTTP server answering PostgREST,
Auth and Storage requests with sample rows), with the dev server's
`NEXT_PUBLIC_SUPABASE_URL` pointed at it. Playwright set an
`sb-localhost-auth-token` cookie holding a fake session to sign in as a
user, a dealer or an admin. It isn't in the repo; rebuild it if needed. The
simpler option, which can't sign in, is placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder npx next dev -p 3200
```

Then render the `*View` components with sample data from a git-excluded
`src/app/dev-preview/` folder. It's listed in `.git/info/exclude`, so
it's never committed and has to be recreated in a fresh checkout. That's
why pages are split into `page.tsx` (fetching) and `*View.tsx` (markup).

**Before pushing:**
- Run `npx tsc --noEmit`, `npx eslint src` and a production build.
- Move `dev-preview` out of the way first, or the build tries to include
  it.
- After the deploy, screenshot the live site at 1440px and 390px wide,
  and check there's no sideways scroll, no broken images and no console
  errors.

**Live-site rules:**
- Never show invented data: no "Featured" badge without a paid
  placement, and no fake events or advertisers.
- A private seller's phone number is never shown signed out.
