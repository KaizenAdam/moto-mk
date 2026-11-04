"use client";

import { openCookieSettings } from "./CookieBar";

/** The footer link that brings the cookies & language bar back. */
export default function CookieSettingsLink() {
  return (
    <button type="button" onClick={openCookieSettings} className="hover:text-highlight hover:underline">
      Cookies &amp; language
    </button>
  );
}
