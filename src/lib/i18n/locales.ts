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
  /** Two or three letters, shown beside the badge. */
  short: string;
  /**
   * Which badge to draw. A flag where one is unambiguous; a letter from the
   * language's own script where it is not.
   *
   * Arabic and Punjabi have no honest flag. Arabic is spoken across twenty-odd
   * countries and picking one of them tells most Arabic speakers this was not
   * built with them in mind; Punjab is split between India and Pakistan, so
   * either flag misidentifies half the people who would reach for it. Those
   * two get their own first letter instead, at the same size and in the same
   * circle, so the row still reads as one set.
   */
  badge: "uk" | "scotland" | "poland" | "ukraine" | "pakistan" | "china" | string;
};

export const LOCALES: Locale[] = [
  { code: "en", name: "English", english: "English", dir: "ltr", short: "EN", badge: "uk" },
  { code: "gd", name: "Gàidhlig", english: "Scottish Gaelic", dir: "ltr", short: "GD", badge: "scotland" },
  { code: "sco", name: "Scots", english: "Scots", dir: "ltr", short: "SCO", badge: "scotland" },
  { code: "pl", name: "Polski", english: "Polish", dir: "ltr", short: "PL", badge: "poland" },
  { code: "uk", name: "Українська", english: "Ukrainian", dir: "ltr", short: "UK", badge: "ukraine" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl", short: "AR", badge: "ع" },
  { code: "ur", name: "اردو", english: "Urdu", dir: "rtl", short: "UR", badge: "pakistan" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", dir: "ltr", short: "PA", badge: "ਪ" },
  { code: "zh", name: "简体中文", english: "Chinese, simplified", dir: "ltr", short: "ZH", badge: "china" },
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
