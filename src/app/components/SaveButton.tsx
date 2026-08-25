"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSavedAction } from "@/app/actions/savedListings";

export default function SaveButton({
  listingId,
  initiallySaved,
  isLoggedIn,
}: {
  listingId: string;
  initiallySaved: boolean;
  isLoggedIn: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="text-sm text-zinc-500 hover:text-amber-400">
        Log in to save
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !saved;
        setSaved(next);
        startTransition(async () => {
          await toggleSavedAction(listingId, saved);
        });
      }}
      className="text-sm text-zinc-400 hover:text-amber-400 disabled:opacity-60"
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
