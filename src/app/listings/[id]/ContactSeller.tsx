import Link from "next/link";
import { formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import { button } from "@/app/components/ui";
import Badge from "@/app/components/Badge";
import { PlaceIcon } from "@/app/components/icons";

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
    <section className="rounded-[10px] border border-line bg-panel p-5">
      <h2 className="font-display mb-3 text-xl">Contact seller</h2>
      <div className="mb-4 text-sm">
        <p className="flex flex-wrap items-center gap-2 text-ink">
          {p.dealer?.business_name ?? p.sellerName ?? "Private seller"}
          {p.dealer ? <Badge>Verified dealer</Badge> : <Badge tone="muted">Private seller</Badge>}
        </p>
        {(p.dealer?.town ?? p.sellerTown) && <p className="text-grey">{p.dealer?.town ?? p.sellerTown}</p>}
      </div>

      {c.mode === "login" && (
        <>
          <Link href="/login" className={`${button("primary", "lg")} w-full`}>
            Log in to contact
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
            <a href={c.tel} className={`${button("primary", "lg")} w-full`}>
              Call {formatPhone(c.phone)}
            </a>
          ) : (
            <p className="text-ink">{c.phone}</p>
          )}
          {c.wa && (
            <a href={c.wa} target="_blank" rel="noopener noreferrer" className={`${button("whatsapp", "lg")} w-full`}>
              WhatsApp
            </a>
          )}
        </div>
      )}
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
        <Link href="/login" className={`${button("primary", "md")} w-full`}>
          Log in to contact the seller
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {c.tel && (
            <a href={c.tel} className={`${button("primary", "md")} w-full`}>
              Call
            </a>
          )}
          {c.wa && (
            <a
              href={c.wa}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button("whatsapp", "md")} w-full ${c.tel ? "" : "col-span-2"}`}
            >
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
    <section className="rounded-[10px] border border-line bg-panel p-5">
      <h2 className="font-display mb-4 text-xl">Meet the seller</h2>
      <div className="flex items-start gap-4">
        <div className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-panel2 text-2xl text-gold">
          {(d?.business_name ?? p.sellerName ?? "?").charAt(0)}
        </div>
        <div className="min-w-0 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-base text-ink">
            {d?.business_name ?? p.sellerName ?? "Private seller"}
            {d ? <Badge>Verified dealer</Badge> : <Badge tone="muted">Private seller</Badge>}
          </p>
          {(d?.town ?? p.sellerTown) && (
            <p className="mt-1 flex items-center gap-1.5 text-grey">
              <PlaceIcon className="h-4 w-4 text-gold" />
              {mapQuery ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-bright"
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
            <Link href={`/dealers/${d.slug}`} className={`${button("outline", "sm")} mt-3`}>
              See all their bikes →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
