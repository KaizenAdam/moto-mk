import Link from "next/link";
import { formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";

/**
 * Seller box on a listing page. A private seller's phone, Call and
 * WhatsApp are for signed-in visitors only — the number never reaches a
 * signed-out page, so it can't be scraped. A verified dealer's shop line
 * is public (it's on their storefront anyway), so everyone gets it. The
 * WhatsApp message names the bike and links back to it.
 */
export default function ContactSeller({
  sellerName,
  sellerTown,
  contact,
  isLoggedIn,
  isOwnListing,
  bikeName,
  listingUrl,
  editHref,
  dealer,
}: {
  sellerName: string | null;
  sellerTown: string | null;
  contact: { phone: string } | null;
  isLoggedIn: boolean;
  isOwnListing: boolean;
  bikeName: string;
  listingUrl: string;
  editHref: string;
  dealer: { slug: string; business_name: string; phone: string | null } | null;
}) {
  // A dealer's public shop line wins; otherwise the private contact (if any).
  const shownContact = dealer?.phone ? { phone: dealer.phone } : contact;
  const mustLogIn = !isLoggedIn && !dealer?.phone;
  const wa = shownContact
    ? whatsAppHref(
        shownContact.phone,
        `Hi, I'm interested in your ${bikeName} on Just5Up! ${listingUrl}`
      )
    : null;
  const tel = shownContact ? telHref(shownContact.phone) : null;

  return (
    <div className="rounded-md border border-line bg-panel2 p-4 text-sm">
      {dealer ? (
        <>
          <p className="flex items-center gap-2 text-ink-dim">
            Seller
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#141414] uppercase">
              Verified dealer
            </span>
          </p>
          <p className="text-ink">{dealer.business_name}</p>
          {sellerTown && <p className="text-grey">{sellerTown}</p>}
          <Link href={`/dealers/${dealer.slug}`} className="mt-1 inline-block text-gold-bright hover:underline">
            See all their bikes →
          </Link>
        </>
      ) : (
        <>
          <p className="text-ink-dim">Seller</p>
          <p className="text-ink">{sellerName ?? "—"}</p>
          {sellerTown && <p className="text-grey">{sellerTown}</p>}
        </>
      )}

      <div className="mt-4">
        {mustLogIn ? (
          <Link
            href="/login"
            className="inline-block rounded-md bg-gradient-to-br from-gold-bright to-gold px-4 py-2.5 text-xs font-bold tracking-wide text-[#141414] uppercase"
          >
            Log in to contact the seller
          </Link>
        ) : isOwnListing ? (
          <p className="text-grey">
            This is your listing.{" "}
            <Link href={editHref} className="text-gold-bright hover:underline">
              Edit it
            </Link>
          </p>
        ) : !shownContact ? (
          <p className="text-grey">The seller hasn&rsquo;t added a phone number yet.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#25D366] px-4 py-2.5 text-xs font-bold tracking-wide text-[#0b0b0d] uppercase hover:brightness-110"
              >
                WhatsApp
              </a>
            )}
            {tel && (
              <a
                href={tel}
                className="rounded-md border border-line px-4 py-2.5 text-xs font-bold tracking-wide text-ink uppercase hover:border-gold"
              >
                Call {formatPhone(shownContact.phone)}
              </a>
            )}
            {!tel && <span className="text-ink">{shownContact.phone}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
