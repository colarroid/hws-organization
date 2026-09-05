import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The organisation screens, waiting.
 *
 * Covers the summary and the profile form under it, which is the longest read
 * in the portal.
 */
export default function Loading() {
  return <LoadingScreen title="Getting your profile…" width={660} count={3} />;
}
