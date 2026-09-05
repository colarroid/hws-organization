import { Page } from "@/components/ui/Page";
import { LoadingBlock, LoadingFrame } from "@/components/ui/LoadingScreen";

/**
 * The dashboard, waiting.
 *
 * The slowest screen in the portal: it reads the organisation, its listings
 * and the reach figures, and the figures are an aggregate over a period. So
 * this is where drawing the real shape earns its keep.
 *
 * The three number cards are at their real height. A row that grows from
 * nothing to 150px as the counts land pushes everything below it down the
 * page just as somebody starts reading it.
 */
export default function Loading() {
  return (
    <LoadingFrame label="Loading your dashboard">
      <Page width={900} top={56} gap={28}>
        <div className="flex flex-col gap-7" aria-hidden="true">
          <LoadingBlock index={0} height={46} className="w-[46%]" />

          {/* The period chips, at the width their labels come out at. */}
          <div className="flex flex-wrap gap-[10px]">
            {["w-[96px]", "w-[110px]", "w-[86px]"].map((width, index) => (
              <LoadingBlock
                key={width}
                index={index}
                height={44}
                radius="rounded-full"
                className={width}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingBlock key={index} index={index} height={150} />
            ))}
          </div>

          <div className="flex flex-col gap-[14px]">
            <LoadingBlock index={0} height={110} />
            <LoadingBlock index={1} height={110} />
          </div>
        </div>
      </Page>
    </LoadingFrame>
  );
}
