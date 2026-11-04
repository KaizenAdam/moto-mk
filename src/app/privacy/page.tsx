import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/app/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Just5Up! collects, uses and protects your personal data.",
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

/**
 * TEMPLATE privacy policy, written from what the site actually does (see
 * CLAUDE.md). If a feature changes what's collected or who sees it (a new
 * profile field, analytics, payments), update this page in the same change.
 */
const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: (
      <>
        <p>
          Just5Up! is a website for buying and selling motorcycles in North Macedonia. It is run by [company name],
          [registered address], [company registration number] (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are responsible
          for the personal data described here.
        </p>
        <p>Questions about your data: {email}.</p>
      </>
    ),
  },
  {
    heading: "What we collect",
    body: (
      <ul>
        <li>
          <strong>Your account:</strong> email address, password (stored scrambled; we can&rsquo;t read it), name, phone
          number and town.
        </li>
        <li>
          <strong>Your listings:</strong> the bike&rsquo;s details, price, town, description and photos. We remove
          location data (GPS/EXIF) from photos before they&rsquo;re uploaded.
        </li>
        <li>
          <strong>Saved bikes</strong> you mark with the heart.
        </li>
        <li>
          <strong>Dealer accounts:</strong> business name, address, shop phone number and the &ldquo;about&rdquo; text
          for your storefront.
        </li>
        <li>
          <strong>Technical data:</strong> the essential cookies described below, and the standard logs our hosting
          providers keep for security (such as IP address and browser type).
        </li>
      </ul>
    ),
  },
  {
    heading: "What other people can see",
    body: (
      <ul>
        <li>Your listings, with your name and town, once we&rsquo;ve approved them.</li>
        <li>
          <strong>Your phone number, only to signed-in visitors</strong>, through the Call and WhatsApp buttons on your
          listings. It&rsquo;s never shown to people who aren&rsquo;t signed in.
        </li>
        <li>For dealers: the storefront, including the shop phone and address, which are public by design.</li>
        <li>Your email address is never shown to other users.</li>
      </ul>
    ),
  },
  {
    heading: "How we use it",
    body: (
      <ul>
        <li>To run your account and show your listings.</li>
        <li>To review every listing before it goes live, and to keep the site free of scams and misuse.</li>
        <li>To let buyers contact you about your bike.</li>
        <li>To send emails you need, such as confirming your account or resetting your password.</li>
      </ul>
    ),
  },
  {
    heading: "Our legal basis",
    body: (
      <p>
        We use your data to provide the service you signed up for (contract), to keep the site safe and working
        (legitimate interests), and, where we ask, with your consent. [Confirm with a lawyer whether North
        Macedonia&rsquo;s Law on Personal Data Protection, the UK GDPR, or both apply, depending on which company runs
        the site.]
      </p>
    ),
  },
  {
    heading: "Who we share it with",
    body: (
      <>
        <p>We don&rsquo;t sell your data, and there are no advertising or tracking cookies on the site.</p>
        <p>We use these providers to run the site:</p>
        <ul>
          <li>
            <strong>Supabase:</strong> our database, sign-in and photo storage, hosted in Frankfurt, Germany.
          </li>
          <li>
            <strong>Vercel:</strong> hosts the website. Pages are built in Frankfurt and delivered through
            Vercel&rsquo;s global network.
          </li>
          <li>
            <strong>OpenStreetMap:</strong> the map on the Service centres page loads map images from
            OpenStreetMap&rsquo;s servers, which see your IP address. [Update if the map provider changes.]
          </li>
        </ul>
        <p>
          Links to WhatsApp and Google Maps take you to those services, whose own privacy policies apply. We may also
          share data where the law requires it.
        </p>
      </>
    ),
  },
  {
    heading: "Cookies",
    body: (
      <>
        <p>We only use essential cookies:</p>
        <ul>
          <li>
            <strong>Sign-in cookie</strong> (set by Supabase): keeps you signed in. It&rsquo;s removed when you sign
            out.
          </li>
          <li>
            <strong>j5_consent</strong> and <strong>j5_lang</strong>: remember that you&rsquo;ve seen the cookies
            message and your preferred language, for a year.
          </li>
        </ul>
        <p>You can change your language choice from &ldquo;Cookies &amp; language&rdquo; at the bottom of any page.</p>
      </>
    ),
  },
  {
    heading: "How long we keep it",
    body: (
      <p>
        We keep your account data while your account is open. When you delete a listing, its photos are deleted too. To
        close your account and delete your data, email {email}. [Confirm how long logs and backups are kept.]
      </p>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        <p>
          You can ask to see, correct or delete your data, to limit or object to how we use it, or to receive a copy.
          You can edit your name, phone and town yourself in <Link href="/garage">My Garage</Link>. For anything else,
          email {email}.
        </p>
        <p>
          If you&rsquo;re unhappy with how we handle your data, you can complain to North Macedonia&rsquo;s Personal
          Data Protection Agency (Агенција за заштита на личните податоци). [Add the UK ICO if a UK company runs the
          site.]
        </p>
      </>
    ),
  },
  {
    heading: "Children",
    body: <p>Just5Up! is for people aged [18] and over. We don&rsquo;t knowingly collect data from children.</p>,
  },
  {
    heading: "Changes",
    body: (
      <p>
        If we change this policy, we&rsquo;ll update the date at the top, and tell account holders by email about any
        big change.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      first="Privacy"
      highlight="policy"
      intro="What we collect, who can see it, and what you can do about it. In plain English."
      updated="[date] (draft, 4 November 2026)"
      shard={{
        shape: "bent",
        className: "top-[-30%] right-[-70px] h-[160%] w-[300px] rotate-[34deg] bg-red/[.16] sm:right-[10%]",
      }}
      sections={SECTIONS}
    />
  );
}
