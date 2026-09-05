import { LoadingPage } from "@/components/ui/LoadingScreen";

/**
 * The organisation screens, waiting.
 *
 * Covers the summary and the profile form under it, which is the longest read
 * in the portal.
 */
export default function Loading() {
  return <LoadingPage label="Loading your organisation" width={660} count={3} />;
}
