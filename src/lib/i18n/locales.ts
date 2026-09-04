/**
 * The languages the platform offers.
 *
 * Chosen from what people in Scotland actually speak rather than from what is
 * easy to translate. English first because it is what most of the site is
 * written in; then the two indigenous languages, which are not here for
 * completeness — Gaelic has its own Act and Scots is the first language of a
 * large part of the country; then the languages of the communities the
 * platform is most likely to reach that English does not.
 *
 * Every name is written in its own language. A dropdown listing "Polish" and
 * "Arabic" in English is asking somebody to find their language in a language
 * they may not read.
 *
 * The list is deliberately short. Each entry is a promise that the pages
 * behind it are readable, and an entry that opens a half-translated page is
 * worse than no entry at all.
 */

export type Locale = {
  code: string;
  /** In its own language. */
  name: string;
  /** In English, for the accessible name of the control. */
  english: string;
  dir: "ltr" | "rtl";
};

export const LOCALES: Locale[] = [
  { code: "en", name: "English", english: "English", dir: "ltr" },
  { code: "gd", name: "Gàidhlig", english: "Scottish Gaelic", dir: "ltr" },
  { code: "sco", name: "Scots", english: "Scots", dir: "ltr" },
  { code: "pl", name: "Polski", english: "Polish", dir: "ltr" },
  { code: "uk", name: "Українська", english: "Ukrainian", dir: "ltr" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl" },
  { code: "ur", name: "اردو", english: "Urdu", dir: "rtl" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", dir: "ltr" },
  { code: "zh", name: "简体中文", english: "Chinese, simplified", dir: "ltr" },
];

export const DEFAULT_LOCALE = "en";

/** The cookie the choice lives in. Read on the server, so no flash. */
export const LOCALE_COOKIE = "hws_locale";

export function isLocale(code: string | undefined): code is string {
  return Boolean(code && LOCALES.some((l) => l.code === code));
}

export function localeFor(code: string | undefined): Locale {
  return (
    LOCALES.find((l) => l.code === code) ??
    LOCALES.find((l) => l.code === DEFAULT_LOCALE)!
  );
}
