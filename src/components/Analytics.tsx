"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/**
 * Page analytics, with the query string removed before anything is sent.
 *
 * The same component the women's site carries, and it matters more here
 * rather than less. That side strips the query string because it holds what
 * a woman typed about her life. This side strips it because it holds
 * credentials:
 *
 *   /auth/confirm?code=...            a one-time exchange code
 *   /auth/reset?token_hash=...        a password reset token
 *
 * Either of those in an analytics dashboard is a live way into somebody's
 * account sitting in a third-party log. Nothing here is on a list of routes
 * to remember: the query string goes from every event, everywhere, so a new
 * screen cannot leak one by being added later.
 *
 * What survives is the path, which is the whole of what this is for — which
 * steps of onboarding get abandoned, and where.
 *
 * Vercel Web Analytics sets no cookie and stores no identifier, so it needs
 * no consent gate. It reports nothing until Web Analytics is enabled for this
 * project in the Vercel dashboard; until then the script 404s and the portal
 * carries on, which is the right failure.
 */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          if (!url.search) return event;
          url.search = "";
          return { ...event, url: url.toString() };
        } catch {
          // An unparseable URL is not worth reporting, and guessing at how to
          // clean it is how a reset token ends up in a dashboard.
          return null;
        }
      }}
    />
  );
}
