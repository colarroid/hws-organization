import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Submitted for review" };

/**
 * Screen 12. Submitted for review.
 *
 * Confirms, and says what happens next. The "what we check" panel ends on the
 * promise that wording is never edited silently, which is why every review
 * action leaves a row in listing_reviews.
 */
export default function SubmittedPage() {
  return (
    <Page width={620} top={88}>
      <span className="flex text-green-700">
        <BadgeCheck size={40} strokeWidth={2} aria-hidden="true" />
      </span>

      <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
        Submitted for review
      </h1>

      <p className="m-0 text-[18px] leading-[1.6] text-ink-70">
        We read every listing before it goes live, usually within two working
        days. We will email you when it publishes, or if we need to ask you
        something.
      </p>

      <div className="flex flex-col gap-[10px] rounded-card shadow-hairline bg-surface px-[22px] py-5">
        <span className="text-[16px] font-bold">What we check</span>
        <span className="text-[15px] leading-[1.6] text-ink-70">
          That the eligibility is clear, the dates are real, the link works, and
          the plain-language description matches what you actually run. We may
          edit wording for clarity and will tell you if we do.
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/solutions/new" size="inline" className="px-7 py-4 text-[17px]">
          Post another solution
        </ButtonLink>
        <ButtonLink
          href="/dashboard"
          variant="secondary"
          size="inline"
          className="px-[22px] py-[15px] text-[16px]"
        >
          Back to my solutions
        </ButtonLink>
      </div>
    </Page>
  );
}
