"use client";

import { openCookieSettings } from "./CookieBar";
import { useI18n } from "./I18nProvider";

/** The footer link that brings the cookies & language bar back. */
export default function CookieSettingsLink() {
  const { t } = useI18n();
  return (
    <button type="button" onClick={openCookieSettings} className="hover:text-highlight hover:underline">
      {t.cookies.settings}
    </button>
  );
}
