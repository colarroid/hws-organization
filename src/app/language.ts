"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

/**
 * Remember the language somebody picked.
 *
 * On the parent domain rather than this host, so a choice made here is still
 * in force on the organisation portal. The two are different subdomains of
 * one platform and asking twice would be asking somebody who is already
 * reading a second language to do the work again.
 *
 * A year, because a language is not a session preference. httpOnly is off on
 * purpose: nothing here is sensitive, and leaving it readable means the
 * client can tell without a round trip.
 */
export async function setLanguage(formData: FormData) {
  const chosen = String(formData.get("locale") ?? "");
  if (!isLocale(chosen)) return;

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  // "localhost:3000" has a port and is not a domain a cookie can be scoped
  // to, so in development it stays on the host it was set from.
  const shareable = root && !root.startsWith("localhost") && !root.includes(":");

  const store = await cookies();
  store.set(LOCALE_COOKIE, chosen, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    ...(shareable ? { domain: `.${root.replace(/^www\./, "")}` } : {}),
  });

  revalidatePath("/", "layout");
}
