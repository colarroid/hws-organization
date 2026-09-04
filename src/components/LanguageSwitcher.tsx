"use client";

import { useRef } from "react";
import { Languages } from "lucide-react";
import { LOCALES } from "@/lib/i18n/locales";
import { setLanguage } from "@/app/language";

/**
 * Choosing a language.
 *
 * A native select rather than a styled listbox. It is the one control on the
 * site most likely to be used by somebody who is not reading the interface
 * confidently, and the platform's own dropdown is worth less here than the
 * one her phone already knows how to open, in her own writing system, with
 * her own font stack.
 *
 * It submits on change, so the choice takes effect without a second tap on a
 * button labelled in a language she may not read. The button below it is for
 * anyone whose browser does not fire change until blur, and it is hidden from
 * everyone else rather than removed.
 */
export function LanguageSwitcher({
  label,
  current,
}: {
  label: string;
  /** So the control opens on the language already in force. */
  current: string;
}) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={setLanguage}
      className="flex items-center gap-2"
    >
      <label
        htmlFor="locale"
        className="flex items-center gap-[6px] text-[14px] font-semibold text-ink-70"
      >
        <Languages size={16} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">{label}</span>
      </label>

      <select
        id="locale"
        name="locale"
        /* Keyed on the locale so React mounts a fresh select when it changes.
           defaultValue is read once, at mount, so without this the control
           kept saying "English" on a page that had just rendered in Polish —
           and the one person guaranteed to notice is the one who cannot read
           the rest of the page to check. */
        key={current}
        defaultValue={current}
        onChange={() => form.current?.requestSubmit()}
        className="min-h-[44px] cursor-pointer rounded-full bg-surface px-4 py-[9px] text-[15px] font-semibold text-ink shadow-hairline"
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.code}>
            {locale.name}
          </option>
        ))}
      </select>

      <noscript>
        <button
          type="submit"
          className="min-h-[44px] rounded-full bg-ink px-4 py-[9px] text-[15px] font-bold text-white"
        >
          OK
        </button>
      </noscript>
    </form>
  );
}
