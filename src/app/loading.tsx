import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav bar and the language stay put and only the middle
 * of the screen is waiting. Nearly every page here reads the organisation
 * before it can render anything, so this shows more often than it does on the
 * public site.
 *
 * The wording is the vaguest in the portal, because it stands in for any
 * screen. Anywhere the wait can be named properly, it is named in that
 * route's own loading.tsx instead.
 */
export default function Loading() {
  return <LoadingScreen title="One moment…" width={820} count={2} />;
}
