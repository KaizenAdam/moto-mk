"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSavedAction } from "@/app/actions/savedListings";
import { toast } from "./Toaster";
import { HeartFilledIcon, HeartIcon } from "./icons";

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
    "flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/80";

  if (!isLoggedIn) {
    return variant === "badge" ? (
      <Link href="/login" className={badgeClass} title="Log in to save" aria-label="Log in to save">
        <HeartIcon className="h-[18px] w-[18px]" />
      </Link>
    ) : (
      <Link href="/login" className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-highlight">
        <HeartIcon />
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
        aria-label={saved ? "Remove from saved" : "Save"}
        aria-pressed={saved}
        className={`${badgeClass} ${saved ? "bg-red hover:bg-red" : ""} disabled:opacity-60`}
      >
        {saved ? <HeartFilledIcon className="h-[18px] w-[18px]" /> : <HeartIcon className="h-[18px] w-[18px]" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      aria-pressed={saved}
      className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-highlight disabled:opacity-60"
    >
      {saved ? <HeartFilledIcon className="h-4 w-4 text-red" /> : <HeartIcon />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
