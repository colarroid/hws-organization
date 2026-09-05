import { Page } from "@/components/ui/Page";
import { SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

/**
 * The dashboard, waiting.
 *
 * The slowest screen in the portal: it reads the organisation, its listings
 * and the reach figures, and the figures are an aggregate over a period. So
 * this is the one place where a shape rather than a blank screen earns its
 * keep.
 *
 * The three number cards are drawn at their real height. They are the thing
 * somebody comes here for, and a row that grows from nothing to 150px as the
 * counts land pushes everything below it down the page just as they start
 * reading it.
 */
export default function Loading() {
  return (
    <Page width={900} top={56} gap={28}>
      <span role="status" aria-live="polite" className="sr-only">
        Loading your dashboard
      </span>

      <div aria-hidden="true" className="flex flex-col gap-7">
        <SkeletonLine width="46%" height={46} />

        <div className="flex flex-wrap gap-[10px]">
          <span className="skeleton block h-[44px] w-[96px] rounded-full" />
          <span className="skeleton block h-[44px] w-[110px] rounded-full" />
          <span className="skeleton block h-[44px] w-[86px] rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[150px] flex-col justify-between rounded-card bg-surface p-6 shadow-hairline"
            >
              <SkeletonLine width="42%" height={46} />
              <SkeletonLine width="76%" height={15} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[14px]">
          <SkeletonLine width="30%" height={20} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </div>
      </div>
    </Page>
  );
}
