import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The solutions list, waiting.
 *
 * Four blocks rather than three, because this is the screen an organisation
 * with anything posted comes back to most, and a shape shorter than the real
 * list makes the page jump upward as it fills.
 */
export default function Loading() {
  return (
    <LoadingScreen title="Getting your solutions…" width={900} count={4} />
  );
}
