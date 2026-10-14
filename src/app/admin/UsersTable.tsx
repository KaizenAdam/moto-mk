"use client";

import { useState } from "react";
import type { Tables } from "@/lib/database.types";
import Badge, { type BadgeTone } from "@/app/components/Badge";
import { input } from "@/app/components/ui";

const ROLE_TONE: Record<string, BadgeTone> = { admin: "red", dealer: "gold", user: "muted" };

/**
 * Every user, with a name/town/phone filter over the rows already fetched.
 * Still unpaginated (docs/HANDOVER-backend.md) — fine at demo scale.
 */
export default function UsersTable({ profiles }: { profiles: Tables<"profiles">[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? profiles.filter((p) => [p.name, p.town, p.phone].some((v) => v?.toLowerCase().includes(needle)))
    : profiles;

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter by name, town or phone…"
        className={`${input} mb-3 max-w-sm`}
      />
      <div className="overflow-x-auto rounded-[10px] border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel2 text-xs tracking-wide text-grey uppercase">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Town</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Account</th>
              <th className="px-3 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-b border-line/60 last:border-0">
                <td className="px-3 py-2 text-ink">{p.name ?? "—"}</td>
                <td className="px-3 py-2 text-ink-dim">{p.town ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-ink-dim">{p.phone ?? "—"}</td>
                <td className="px-3 py-2">
                  <Badge tone={ROLE_TONE[p.account_type] ?? "muted"}>{p.account_type}</Badge>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-ink-dim">
                  {new Date(p.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ink-dim">
                  No users match &ldquo;{q}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-grey">
        Showing {shown.length} of {profiles.length}. Email addresses live in Supabase Auth and aren&rsquo;t
        visible here.
      </p>
    </div>
  );
}
