import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import SellForm from "./SellForm";

export default async function SellPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) redirect("/login");

  return (
    <main>
      <section
        className="border-b border-line px-5 py-8"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
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
