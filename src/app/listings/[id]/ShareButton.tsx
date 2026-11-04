"use client";

import { toast } from "@/app/components/Toaster";
import { ShareIcon } from "@/app/components/icons";
import { useI18n } from "@/app/components/I18nProvider";

/** The phone's own share sheet where there is one; otherwise copies the link. */
export default function ShareButton({ url, title }: { url: string; title: string }) {
  const { t } = useI18n();
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
      toast(t.share.copied);
    } catch {
      window.prompt(t.share.copyPrompt, url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-highlight"
    >
      <ShareIcon />
      {t.share.share}
    </button>
  );
}
