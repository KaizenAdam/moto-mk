import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import SellForm from "./SellForm";
import { heroBackground } from "@/app/components/ui";

export default async function SellPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) redirect("/login");

  return (
    <main>
      <section
        className="border-b border-line px-5 py-8"
        style={{
          background: heroBackground,
        }}
      >
        <div className="mx-auto max-w-[1100px]">
          <h1 className="font-display mb-1.5 text-2xl">List your bike in minutes</h1>
          <p className="text-sm text-ink-dim">
            Free to list. Fill in the details below — a moderator reviews every listing before it
            goes live.
          </p>
        </div>
      </section>

      <SellForm profilePhone={profile.phone} />
    </main>
  );
}
