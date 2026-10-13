"use client";

import { toast } from "@/app/components/Toaster";

/** The phone's own share sheet where there is one; otherwise copies the link. */
export default function ShareButton({ url, title }: { url: string; title: string }) {
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet isn't an error worth showing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button type="button" onClick={share} className="text-sm text-grey hover:text-gold-bright">
      Share
    </button>
  );
}
