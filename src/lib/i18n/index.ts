import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeFor,
  type Locale,
} from "@/lib/i18n/locales";
import { MESSAGES, type MessageKey } from "@/lib/i18n/messages";

/**
 * Reading the chosen language, and the strings that go with it.
 *
 * Server-side, from a cookie, so the page arrives already in her language.
 * The alternative — rendering English and swapping it on the client — shows
 * everybody a flash of a language they may not read, which is worst for
 * exactly the people this is for.
 *
 * A missing translation falls back to English rather than to the key. A
 * screen reading "landing.hero.title" is broken; a screen reading English is
 * merely untranslated, and one of those is recoverable by the woman looking
 * at it.
 */

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  return localeFor(isLocale(chosen) ? chosen : DEFAULT_LOCALE);
}

export type Translate = (key: MessageKey) => string;

/**
 * The translator for one request.
 *
 * Returns a plain function rather than a component or a hook, so a server
 * component can call it inline and nothing about the language has to travel
 * to the browser.
 */
export async function getTranslator(): Promise<{
  locale: Locale;
  t: Translate;
}> {
  const locale = await getLocale();
  const table = MESSAGES[locale.code] ?? {};
  const english = MESSAGES[DEFAULT_LOCALE];

  return {
    locale,
    t: (key) => table[key] ?? english[key] ?? key,
  };
}
