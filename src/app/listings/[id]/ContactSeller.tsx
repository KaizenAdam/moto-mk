import Link from "next/link";
import { formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import Shard from "@/app/components/Shard";
import { PhoneIcon, PlaceIcon, StoreIcon, UserIcon, WhatsAppIcon } from "@/app/components/icons";

/**
 * The seller pieces of a listing page: the sticky contact card, the phone
 * bottom bar and "Meet the seller". They share one set of rules
 * (resolveContact):
 *
 * - A private seller's phone, Call and WhatsApp are for signed-in visitors
 *   only — the number never reaches a signed-out page, so it can't be
 *   scraped.
 * - A verified dealer's shop line is public (it's on their storefront
 *   anyway), so everyone gets it.
 * - The WhatsApp message names the bike and links back to it.
 */
export type ContactProps = {
  sellerName: string | null;
  sellerTown: string | null;
  contact: { phone: string } | null;
  isLoggedIn: boolean;
  isOwnListing: boolean;
  bikeName: string;
  listingUrl: string;
  editHref: string;
  dealer: {
    slug: string;
    business_name: string;
    phone: string | null;
    address: string | null;
    town: string | null;
  } | null;
};

const cta =
  "font-display flex items-center justify-center gap-2 px-5 py-3.5 text-base font-semibold tracking-[.06em] transition hover:brightness-110";
const ctaSm =
  "font-display flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold tracking-[.06em] transition hover:brightness-110";

/** First letter of the seller in a square: gold for a dealer, grey for a private seller. */
function SellerAvatar({ name, dealer, size = "md" }: { name: string | null; dealer: boolean; size?: "md" | "lg" }) {
  return (
    <span
      className={`font-display flex shrink-0 items-center justify-center ${
        size === "lg" ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl"
      } ${dealer ? "bg-highlight text-[#111]" : "bg-panel2 text-ink"}`}
    >
      {(name ?? "?").charAt(0)}
    </span>
  );
}

type Resolved =
  | { mode: "login" }
  | { mode: "own" }
  | { mode: "none" }
  | { mode: "contact"; phone: string; tel: string | null; wa: string | null };

function resolveContact(p: ContactProps): Resolved {
  if (p.isOwnListing) return { mode: "own" };
  // A dealer's public shop line wins; otherwise the private contact (if any).
  const shown = p.dealer?.phone ? { phone: p.dealer.phone } : p.contact;
  if (!p.isLoggedIn && !p.dealer?.phone) return { mode: "login" };
  if (!shown) return { mode: "none" };
  return {
    mode: "contact",
    phone: shown.phone,
    tel: telHref(shown.phone),
    wa: whatsAppHref(shown.phone, `Hi, I'm interested in your ${p.bikeName} on Just5Up! ${p.listingUrl}`),
  };
}

/** Right-hand card on desktop, the first seller block on phones. */
export function ContactCard(p: ContactProps) {
  const c = resolveContact(p);
  return (
    <section className="relative overflow-hidden border-t-4 border-highlight bg-panel p-6">
      <Shard shape="torn" className="top-[-20px] right-[-50px] h-[200px] w-[150px] bg-highlight/[.06]" />
      <h2 className="font-display relative mb-4 text-2xl font-semibold">Contact seller</h2>
      <div className="relative mb-5 flex items-center gap-3">
        <SellerAvatar name={p.dealer?.business_name ?? p.sellerName} dealer={!!p.dealer} />
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold text-ink">{p.dealer?.business_name ?? p.sellerName ?? "Private seller"}</p>
          <p className="text-grey">
            {[p.dealer ? "Verified dealer" : "Private seller", p.dealer?.town ?? p.sellerTown].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div className="relative">

      {c.mode === "login" && (
        <>
          <Link href="/login" className={`${cta} w-full bg-highlight text-[#111]`}>
            Log in to contact &gt;&gt;&gt;
          </Link>
          <p className="mt-2 text-xs text-grey">
            Private sellers&rsquo; numbers are only shown to signed-in riders, to keep them away from
            spam.
          </p>
        </>
      )}
      {c.mode === "own" && (
        <p className="text-sm text-grey">
          This is your listing.{" "}
          <Link href={p.editHref} className="text-gold-bright hover:underline">
            Edit it
          </Link>
        </p>
      )}
      {c.mode === "none" && (
        <p className="text-sm text-grey">The seller hasn&rsquo;t added a phone number yet.</p>
      )}
      {c.mode === "contact" && (
        <div className="grid gap-2.5">
          {c.tel ? (
            <a href={c.tel} className={`${cta} w-full bg-highlight text-[#111]`}>
              <PhoneIcon />
              Call {formatPhone(c.phone)}
            </a>
          ) : (
            <p className="text-ink">{c.phone}</p>
          )}
          {c.wa && (
            <a href={c.wa} target="_blank" rel="noopener noreferrer" className={`${cta} w-full bg-[#25D366] text-[#0b0b0d]`}>
              <WhatsAppIcon />
              WhatsApp
            </a>
          )}
        </div>
      )}
      </div>
    </section>
  );
}

/** Phones only: Call / WhatsApp pinned to the bottom of the screen, like Auto Trader. */
export function MobileContactBar(p: ContactProps) {
  const c = resolveContact(p);
  if (c.mode === "own" || c.mode === "none") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-black/95 px-4 py-3 backdrop-blur lg:hidden">
      {c.mode === "login" ? (
        <Link href="/login" className={`${ctaSm} w-full bg-highlight text-[#111]`}>
          Log in to contact the seller
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {c.tel && (
            <a href={c.tel} className={`${ctaSm} w-full bg-highlight text-[#111]`}>
              <PhoneIcon className="h-4 w-4" />
              Call
            </a>
          )}
          {c.wa && (
            <a
              href={c.wa}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ctaSm} w-full bg-[#25D366] text-[#0b0b0d] ${c.tel ? "" : "col-span-2"}`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Who's selling: a dealer's business, address and storefront, or a private seller's name and town. */
export function MeetTheSeller(p: ContactProps) {
  const d = p.dealer;
  const mapQuery = d?.address ?? null;
  return (
    <section>
      <h2 className="font-display mb-4 text-2xl font-semibold">Meet the seller</h2>
      <div className="flex items-start gap-4 border border-line bg-panel p-5">
        <SellerAvatar name={d?.business_name ?? p.sellerName} dealer={!!d} size="lg" />
        <div className="min-w-0 text-sm">
          <p className="font-display text-xl font-medium text-ink">{d?.business_name ?? p.sellerName ?? "Private seller"}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-grey">
            {d ? <StoreIcon className="h-4 w-4 text-highlight" /> : <UserIcon className="h-4 w-4" />}
            {d ? "Verified dealer" : "Private seller"}
          </p>
          {(d?.town ?? p.sellerTown) && (
            <p className="mt-1 flex items-center gap-1.5 text-grey">
              <PlaceIcon className="h-4 w-4 text-highlight" />
              {mapQuery ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-highlight"
                >
                  {d?.address}
                </a>
              ) : (
                (d?.town ?? p.sellerTown)
              )}
            </p>
          )}
          {d ? (
            <p className="mt-2 text-ink-dim">
              Every dealer on Just5Up! is checked by us before their showroom goes live.
            </p>
          ) : (
            <p className="mt-2 text-ink-dim">Selling privately. Every listing is checked by us before it goes live.</p>
          )}
          {d && (
            <Link
              href={`/dealers/${d.slug}`}
              className="font-display mt-4 inline-block border-2 border-red px-4 py-2 text-sm font-medium tracking-[.06em] text-white transition hover:bg-red"
            >
              See all their bikes &gt;
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
