import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The wait, for every screen that does not name its own.
 *
 * At the root, so the nav bar and the language stay put and only the middle
 * of the screen is waiting. Nearly every page here reads the organisation
 * before it can render anything, so this shows more often than it does on the
 * public site.
 *
 * Deliberately generic. A skeleton that guesses a shape and guesses wrong
 * makes the real screen look like it moved, so this commits to nothing more
 * than a heading and a couple of blocks under it.
 */
export default function Loading() {
  return <SkeletonPage label="Loading" width={820} cards={2} />;
}
