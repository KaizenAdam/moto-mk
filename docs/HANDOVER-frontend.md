# Front-end handover: where the Oct–Nov 2026 design pass is up to

The front-end pass is Billy's work: UI and user journeys only, with
no schema changes. Anything that needs the database is in
`docs/HANDOVER-backend.md`, which Adam (or his Claude) should read before
backend work. `CLAUDE.md` holds the durable rules; this file is the
snapshot of progress and what's next.

Everything below is **live on `main`** (moto-mk.vercel.app). The last
release was `42ee069`, on 4 Nov 2026.

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
  and `/advertise` (ad slots). Both are front end only and their pay
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

## Next: carry the new look through the remaining pages

These pages already have the new header, footer and icons, but still use
the older rounded-card style. Billy offered to do them; this hasn't been
asked for yet:

- `/dealers` and `/dealers/[slug]`
- `/events`
- `/service-centres`
- `/parts-gear`
- `/sell` and `/listings/[id]/edit`
- `/garage`
- `/advertise` and `/listings/[id]/feature`
- `/admin`
- the auth pages: login, signup, forgot and reset password

**How to restyle them:**
- Use square corners.
- Use `highlight` for prices and calls to action, and a red outline for
  secondary actions.
- Headings are plain Oswald h2s (as on the home page) rather than the gold
  underlined `SectionHeading`.
- Use at most one `Shard` per section.
- The listing page (`src/app/listings/[id]/ListingView.tsx`) is the
  pattern to copy.
- **`ui.ts` hasn't been updated:** `button()` and `card` are still
  rounded, so restyled pages write their own square classes for now.
  Once the remaining pages are done, fold those classes into `ui.ts`.
- **Rounded leftovers on the restyled pages:** `Badge` is still a rounded
  pill, and so is the AdSlot house card.

## Not checked yet

- **Signed-in views** after the restyle:
  - a private seller's Call and WhatsApp buttons
  - your own listing ("Edit it")
  - saved hearts
  - the garage

  The local preview can't sign in. Please click through these on a real
  account.
- **`loading.tsx` skeletons:** the home and search skeletons still have
  the old shapes, so they flash briefly before the new layout appears.

## How the work was checked (for whoever picks this up)

**Vercel previews don't work:** they lack the Supabase environment
variables and return a bare 500. So the team pushes to `main` once Billy
has seen screenshots.

**Local check:** run the dev server with placeholder Supabase values:

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
