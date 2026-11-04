import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import SellForm from "./SellForm";
import { BlockHero, HighlightWord } from "@/app/components/Bands";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.sellTitle, robots: { index: false } };
}

export default async function SellPage() {
  const supabase = await createClient();
  const [profile, { t }] = await Promise.all([getOwnProfile(supabase), getI18n()]);

  if (!profile) redirect("/login");

  return (
    <main>
      <BlockHero
        gradient
        compact
        shard={{
          shape: "bent",
          className: "top-[-25%] right-[-90px] h-[150%] w-[400px] rotate-[8deg] bg-highlight/[.12] sm:right-[12%]",
        }}
        title={
          <>
            {t.sellPage.title1}
            <br />
            <HighlightWord>{t.sellPage.title2}</HighlightWord>
          </>
        }
        intro={t.sellPage.intro}
        ticks={t.sellPage.ticks}
      />

      <SellForm profilePhone={profile.phone} />
    </main>
  );
}
