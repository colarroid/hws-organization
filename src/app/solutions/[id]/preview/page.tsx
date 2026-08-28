import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, EyeOff } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { ResultCard, type ResultCardData } from "@/components/ResultCard";
import { SubmitForReviewButton } from "@/components/organisations/SubmitForReviewButton";
import { getMyOrganisation } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";
import { getListing } from "@/lib/data/listings";
import { COSTS, FORMATS, SOLUTION_KINDS, labelFor } from "@/lib/design/taxonomy";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

export const metadata: Metadata = { title: "How she will see it" };

/**
 * Screen 11. Preview as she will see it.
 *
 * Quality control that a style guide cannot do. It renders the real
 * woman-facing card, not a mock of it, so an organisation sees the
 * consequence of a thin description rather than being told about it.
 *
 * The gaps panel warns and never blocks. An organisation can submit an
 * incomplete listing; review catches it.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  // Onboarding can be broken off after step 1, which is what creates the
  // organisation. Finish it before anything that assumes it is done.
  const nextStep = onboardingNextStep(organisation);
  if (nextStep) redirect(nextStep);

  const { id } = await params;
  const listing = await getListing(id);

  if (!listing || listing.organisation_id !== organisation.id) notFound();

  const tags = [
    labelFor(SOLUTION_KINDS, listing.kind),
    labelFor(COSTS, listing.cost),
    ...listing.formats.map((f) => labelFor(FORMATS, f)),
  ].filter(Boolean);

  const card: ResultCardData = {
    name: listing.name,
    source: [organisation.name, listing.place].filter(Boolean).join(" · "),
    blurb: listing.blurb ?? "",
    tags,
    deadline: listing.deadline
      ? `Closes ${DATE.format(new Date(listing.deadline))}`
      : null,
    whoFor: listing.who_for ?? "",
    whatToExpect: listing.what_to_expect ?? "",
    why: "written by us from her answers, so she knows why she is seeing this.",
    verified: "Verified once we check this listing",
  };

  // Each gap names its consequence for a woman rather than the rule it broke.
  const gaps = [
    !listing.who_for?.trim() &&
      "Who it is for is empty. Without it she cannot tell whether she qualifies, and this is the field women read first.",
    !listing.what_to_expect?.trim() &&
      "What to expect is empty. Not knowing what happens next is the most common reason a woman does not apply.",
    listing.situationIds.length === 0 &&
      "No situations picked, so we can only match this on your words and location.",
  ].filter((g): g is string => Boolean(g));

  return (
    <Page width={820} top={56} gap={24}>
      <Link
        href={`/solutions/${listing.id}/edit`}
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Keep editing
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
          How she will see it
        </h1>
        {/* Sets the expectation before anyone asks to control the reason. */}
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          This is the card in her results. The match reason is written by us
          from her answers, not by you.
        </p>
      </div>

      {/* The heading above promises this is what she sees. While it is hidden
          that is not true, and saying so here is cheaper than letting someone
          wonder why a perfect-looking card gets no views. */}
      {listing.hidden_at ? (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-red-200 bg-red-50 px-[22px] py-5">
          <EyeOff size={20} strokeWidth={2} className="shrink-0 text-red-700" aria-hidden="true" />
          <span className="text-[16px] leading-[1.5] text-red-700">
            <strong>She is not seeing it at the moment.</strong>{" "}
            We have taken it down while something is sorted. The reason is on
            your solutions list.
          </span>
        </div>
      ) : null}

      <ResultCard data={card} strongest showGaps />

      {gaps.length > 0 ? (
        <div className="flex flex-col gap-[10px] rounded-card border border-red-200 bg-red-50 px-[22px] py-5">
          <span className="text-[16px] font-bold text-red-700">
            Worth filling in before you submit
          </span>
          {gaps.map((gap) => (
            <span key={gap} className="text-[15px] leading-[1.5] text-red-700">
              {gap}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
        <SubmitForReviewButton listingId={listing.id} />
        <ButtonLink
          href={`/solutions/${listing.id}/edit`}
          variant="secondary"
          size="inline"
          className="px-[22px] py-[15px] text-[16px]"
        >
          Keep editing
        </ButtonLink>
      </div>
    </Page>
  );
}
