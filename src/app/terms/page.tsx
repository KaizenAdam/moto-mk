import type { Metadata } from "next";
import LegalPage from "@/app/components/LegalPage";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.termsTitle, description: t.meta.termsDescription };
}

/**
 * TEMPLATE terms of use (text in the dictionaries, `legal.terms`), written
 * from how the site works today (free listings, every one reviewed, no
 * payments). Add the paid-promotion terms when featured listings and ads go
 * live (docs/HANDOVER-backend.md).
 */
export default function TermsPage() {
  return (
    <LegalPage
      doc="terms"
      shard={{
        shape: "double",
        className:
          "top-[-15%] right-[-150px] h-[130%] w-[380px] -scale-x-100 rotate-[22deg] bg-highlight/[.10] sm:right-[6%]",
      }}
    />
  );
}
