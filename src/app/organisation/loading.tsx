import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The organisation screens, waiting.
 *
 * Covers both the summary and the profile form under it. A form is a stack of
 * labelled blocks, which is close enough to what these cards draw, and the
 * one below is the longest read in the portal.
 */
export default function Loading() {
  return <SkeletonPage label="Loading your organisation" width={660} cards={3} />;
}
