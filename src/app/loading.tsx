import { LoadingPage } from "@/components/ui/LoadingScreen";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav bar and the language stay put and only the middle
 * of the screen is waiting. Nearly every page here reads the organisation
 * before it can render anything, so this shows more often than it does on the
 * public site.
 */
export default function Loading() {
  return <LoadingPage label="Loading" width={820} count={2} />;
}
