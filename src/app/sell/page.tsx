import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import SellForm from "./SellForm";
import PageHero from "@/app/components/PageHero";

export default async function SellPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) redirect("/login");

  return (
    <main>
      <PageHero
        width="narrow"
        title="List your bike in minutes"
        intro="Free to list. Fill in the details below — a moderator reviews every listing before it goes live."
      />

      <SellForm profilePhone={profile.phone} />
    </main>
  );
}
