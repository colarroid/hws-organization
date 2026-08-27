import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Page } from "@/components/ui/Page";

type OnboardingShellProps = {
  /** 1, 2 or 3. There is no fourth screen. */
  step: 1 | 2 | 3;
  backHref: string;
  title: string;
  intro: string;
  width: number;
  children: ReactNode;
};

/**
 * Three, because there are three screens.
 *
 * This counted to four so the bar could fill completely, treating the
 * dashboard as a fourth step. The bar was the wrong thing to optimise: the
 * counter beside it was promising a form that does not exist. The woman-facing
 * flow already settles this, moving in thirds across three questions and
 * reaching 100% on the last one, and decision 5 rejects "of 4" for the same
 * reason on that side.
 */
const TOTAL_STEPS = 3;

export function OnboardingShell({
  step,
  backHref,
  title,
  intro,
  width,
  children,
}: OnboardingShellProps) {
  const percent = (step / TOTAL_STEPS) * 100;

  return (
    <>
      {/* Full-bleed under the header, gold fill on a hairline-soft track. */}
      <div
        className="h-1 w-full bg-hairline-soft"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${step} of ${TOTAL_STEPS}`}
      >
        <div className="h-1 bg-gold-500" style={{ width: `${percent}%` }} />
      </div>

      <Page width={width} top={56} gap={26}>
        <div className="flex items-center justify-between text-[14px] text-ink-60">
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] items-center gap-[6px] text-[14px] font-bold text-ink no-underline"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            Back
          </Link>
          <span className="font-semibold">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="flex flex-col gap-[10px]">
          <h1 className="m-0 font-display text-[42px] font-normal leading-[1.1] tracking-[-0.01em]">
            {title}
          </h1>
          <p className="m-0 text-[17px] leading-[1.55] text-ink-70">{intro}</p>
        </div>

        {children}
      </Page>
    </>
  );
}
