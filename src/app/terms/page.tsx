import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/app/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for buying, selling and listing motorcycles on Just5Up!.",
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

/**
 * TEMPLATE terms of use, written from how the site works today (free
 * listings, every one reviewed, no payments). Add the paid-promotion terms
 * here when featured listings and ads go live (docs/HANDOVER-backend.md).
 */
const SECTIONS: LegalSection[] = [
  {
    heading: "About Just5Up!",
    body: (
      <>
        <p>
          Just5Up! is a classifieds website, run by [company name], [registered address], where riders and dealers list
          motorcycles for sale in North Macedonia. By using the site you agree to these terms.
        </p>
        <p>
          <strong>We don&rsquo;t sell bikes and we&rsquo;re not part of any sale.</strong> Buyers and sellers deal with
          each other directly. We don&rsquo;t take payments or hold money for anyone.
        </p>
      </>
    ),
  },
  {
    heading: "Your account",
    body: (
      <ul>
        <li>You must be [18] or over, and give your real name and a working phone number.</li>
        <li>Keep your password to yourself. You&rsquo;re responsible for what happens on your account.</li>
        <li>
          Dealer accounts are for real businesses. We approve each one, and that&rsquo;s what &ldquo;Verified
          dealer&rdquo; means: we&rsquo;ve approved the business account, not that we&rsquo;ve inspected its bikes.
        </li>
      </ul>
    ),
  },
  {
    heading: "Listing a bike",
    body: (
      <ul>
        <li>Listing is free.</li>
        <li>You must own the bike, or be allowed to sell it, and it must be legal to sell.</li>
        <li>Describe it honestly, including faults, and use your own photos of the actual bike. Price it in euros.</li>
        <li>
          We review every listing before it goes live, and we may reject or remove one that breaks these terms. If we
          reject it, we&rsquo;ll tell you why so you can fix it.
        </li>
        <li>Editing a live listing sends it back for review. Changing only the price doesn&rsquo;t.</li>
        <li>Mark your bike as sold, or delete the listing, once it&rsquo;s gone.</li>
      </ul>
    ),
  },
  {
    heading: "What's not allowed",
    body: (
      <ul>
        <li>Stolen bikes, or bikes without the right ownership papers.</li>
        <li>False or misleading details, or photos that aren&rsquo;t of the bike you&rsquo;re selling.</li>
        <li>Anything other than motorcycles and scooters (parts and gear will have their own section).</li>
        <li>Spam, duplicate listings, or offensive content.</li>
        <li>Using other users&rsquo; contact details for anything except asking about their bike.</li>
      </ul>
    ),
  },
  {
    heading: "Buying safely",
    body: (
      <ul>
        <li>See the bike in person, and check its registration and ownership documents before you pay.</li>
        <li>Never send a deposit or payment for a bike you haven&rsquo;t seen.</li>
        <li>Meet somewhere public, and bring someone with you for a test ride.</li>
        <li>If a listing looks wrong, tell us at {email}.</li>
      </ul>
    ),
  },
  {
    heading: "Your content",
    body: (
      <p>
        You keep ownership of the photos and text you post. You let us show them on Just5Up! and use them to promote
        your listing on the site for as long as it&rsquo;s listed.
      </p>
    ),
  },
  {
    heading: "Paid extras",
    body: (
      <p>
        Featuring a bike, bumping it and advertising aren&rsquo;t on sale yet. When they are, their prices and terms
        will be shown before you pay. [Add refund and cancellation terms then.]
      </p>
    ),
  },
  {
    heading: "Our responsibility",
    body: (
      <p>
        We check listings, but we can&rsquo;t guarantee any bike, buyer or seller. We aren&rsquo;t responsible for the
        sales you make or for losses caused by other users. Nothing here limits responsibility the law doesn&rsquo;t
        allow us to limit. [Have a lawyer review this section.]
      </p>
    ),
  },
  {
    heading: "Suspending accounts",
    body: (
      <p>
        You can stop using Just5Up! at any time. We may suspend or close an account that breaks these terms, and remove
        its listings.
      </p>
    ),
  },
  {
    heading: "Changes and the law",
    body: (
      <>
        <p>
          If we change these terms, we&rsquo;ll update the date at the top. Using the site afterwards means you accept
          them.
        </p>
        <p>These terms are governed by the laws of [North Macedonia / England and Wales, to confirm].</p>
      </>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about these terms: {email}. How we handle your data is in our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      first="Terms of"
      highlight="use"
      intro="The rules for listing, buying and selling on Just5Up!."
      updated="[date] (draft, 4 November 2026)"
      shard={{
        shape: "double",
        className:
          "top-[-15%] right-[-150px] h-[130%] w-[380px] -scale-x-100 rotate-[22deg] bg-highlight/[.10] sm:right-[6%]",
      }}
      sections={SECTIONS}
    />
  );
}
