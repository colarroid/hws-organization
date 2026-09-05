import { LoadingBlock, LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The dashboard, waiting.
 *
 * The slowest screen in the portal: it reads the organisation, its listings
 * and the reach figures, and the figures are an aggregate over a period. So
 * this is the one place where naming the wait properly earns its keep, and
 * the note says what is actually being counted rather than the usual line.
 *
 * The three number cards are laid out as they land, at their real height. A
 * row that grows from nothing to 150px as the counts arrive pushes everything
 * below it down the page just as somebody starts reading it.
 */
export default function Loading() {
  return (
    <LoadingScreen
      title="Getting your figures…"
      note="We are counting up the period. This usually takes a couple of seconds."
      width={900}
    >
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingBlock key={index} index={index} height={150} />
        ))}
      </div>
    </LoadingScreen>
  );
}
