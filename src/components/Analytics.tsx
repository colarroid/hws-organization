"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Strip the query string off an event before it is sent.
 *
 * The same guard the women's site carries, and it matters more here rather
 * than less. That side removes the query string because it holds what a woman
 * typed about her life. This side removes it because it holds credentials:
 *
 *   /auth/confirm?code=...            a one-time exchange code
 *   /auth/reset?token_hash=...        a password reset token
 *
 * Either of those in an analytics dashboard is a live way into somebody's
 * account sitting in a third-party log. Nothing here is on a list of routes to
 * remember: the query string goes from every event, everywhere, so a screen
 * added later cannot leak one by being forgotten.
 *
 * Shared by both reporters below rather than written twice, because the two
 * drifting apart is exactly what nobody would notice until a token was in a
 * log.
 */
function withoutQuery<T extends { url: string }>(event: T): T | null {
  try {
    const url = new URL(event.url);
    if (!url.search) return event;
    url.search = "";
    return { ...event, url: url.toString() };
  } catch {
    // An unparseable URL is not worth reporting, and guessing at how to clean
    // it is how a reset token ends up in a dashboard.
    return null;
  }
}

/**
 * Page analytics and real-visitor performance for the portal.
 *
 * Analytics answers which steps of onboarding get abandoned and where. Speed
 * Insights answers how the portal actually performed for the person filling it
 * in — which is worth having, because an organisation abandoning step three is
 * the same shape of number whether the form is confusing or simply slow, and
 * those want opposite fixes.
 *
 * Vercel's, not Google's: no cookie, no identifier, nobody followed between
 * sites, so no consent gate is needed. Neither reports anything until it is
 * enabled for this project in the Vercel dashboard; until then the scripts
 * 404 and the portal carries on.
 */
export function Analytics() {
  return (
    <>
      <VercelAnalytics beforeSend={withoutQuery} />
      <SpeedInsights beforeSend={withoutQuery} />
    </>
  );
}
