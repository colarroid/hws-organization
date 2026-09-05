import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The solutions list, waiting.
 *
 * A stack of rows, which is what lands. Four rather than three because this
 * is the screen an organisation with anything posted comes back to most, and
 * a shape that is shorter than the real list makes the page jump upward as it
 * fills.
 */
export default function Loading() {
  return <SkeletonPage label="Loading your solutions" width={900} cards={4} />;
}
