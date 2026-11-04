import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import SellForm from "./SellForm";
import { BlockHero, HighlightWord } from "@/app/components/Bands";

export default async function SellPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) redirect("/login");

  return (
    <main>
      <BlockHero
        gradient
        compact
        shard={{ shape: "bent", className: "top-[-25%] right-[-90px] h-[150%] w-[400px] rotate-[8deg] bg-highlight/[.12] sm:right-[12%]" }}
        title={
          <>
            Sell your
            <br />
            <HighlightWord>bike</HighlightWord>
          </>
        }
        intro="Fill in the details below. It takes a few minutes."
        ticks={["Free to list", "Checked before it goes live", "Seen by riders all over North Macedonia"]}
      />

      <SellForm profilePhone={profile.phone} />
    </main>
  );
}
