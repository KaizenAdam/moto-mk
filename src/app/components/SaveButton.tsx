"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSavedAction } from "@/app/actions/savedListings";
import { toast } from "./Toaster";

export default function SaveButton({
  listingId,
  initiallySaved,
  isLoggedIn,
  variant = "inline",
}: {
  listingId: string;
  initiallySaved: boolean;
  isLoggedIn: boolean;
  /** "badge" — circular overlay for a card's photo corner. "inline" — labelled text/button for a detail page. */
  variant?: "badge" | "inline";
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  const badgeClass =
    "flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black/50 text-base transition hover:bg-black/70 hover:scale-105";

  if (!isLoggedIn) {
    return variant === "badge" ? (
      <Link href="/login" className={badgeClass} title="Log in to save">
        ♡
      </Link>
    ) : (
      <Link href="/login" className="text-sm text-grey hover:text-gold-bright">
        Log in to save
      </Link>
    );
  }

  function toggle() {
    const wasSaved = saved;
    setSaved(!wasSaved);
    startTransition(async () => {
      try {
        await toggleSavedAction(listingId, wasSaved);
        toast(wasSaved ? "Removed from saved bikes" : "Saved to My Garage");
      } catch {
        setSaved(wasSaved); // the heart shouldn't claim a save that didn't happen
      }
    });
  }

  if (variant === "badge") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={`${badgeClass} ${saved ? "bg-red text-white hover:bg-red" : ""} disabled:opacity-60`}
      >
        {saved ? "♥" : "♡"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      className="text-sm text-ink-dim hover:text-gold-bright disabled:opacity-60"
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
