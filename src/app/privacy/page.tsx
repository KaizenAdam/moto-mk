import type { Metadata } from "next";
import LegalPage from "@/app/components/LegalPage";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.privacyTitle, description: t.meta.privacyDescription };
}

/**
 * TEMPLATE privacy policy (text in the dictionaries, `legal.privacy`),
 * written from what the site actually does (see CLAUDE.md). If a feature
 * changes what's collected or who sees it (a new profile field, analytics,
 * payments), update the text in all three languages in the same change.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      doc="privacy"
      shard={{
        shape: "bent",
        className: "top-[-30%] right-[-70px] h-[160%] w-[300px] rotate-[34deg] bg-red/[.16] sm:right-[10%]",
      }}
    />
  );
}
