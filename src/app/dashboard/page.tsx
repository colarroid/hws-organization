import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, FilePlus2, TriangleAlert } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { Banner } from "@/components/organisations/Banner";
import { ConfirmFreshnessButton } from "@/components/organisations/ConfirmFreshnessButton";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { isVerified, onboardingNextStep } from "@/lib/onboarding";
import {
  getListings,
  getStatsByListing,
  sumStats,
  staleListings,
} from "@/lib/data/listings";
import { countLine, shortDate } from "@/lib/design/listing-copy";

export const metadata: Metadata = { title: "Overview" };

/**
 * Screen 9, first half. Overview.
 *
 * What needs attention, and how the listings are doing. The listings
 * themselves moved to their own screen when the rail arrived, so this one
 * stays short enough to read without scrolling: anything on it is either a
 * number or something asking to be acted on.
 *
 * Order is still the handoff's: verification, then figures, then freshness.
 */
export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed out is a different case from signed in without an organisation.
  // The first belongs at sign-in; the second never finished onboarding.
  if (!user) redirect("/sign-in");

  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  // Onboarding can be broken off after step 1, which is what creates the
  // organisation. Finish it before anything that assumes it is done.
  const nextStep = onboardingNextStep(organisation);
  if (nextStep) redirect(nextStep);

  const listings = await getListings(organisation.id);
  const statsByListing = await getStatsByListing(listings.map((l) => l.id));
  const stats = sumStats(statsByListing);
  const stale = staleListings(listings);
  const hasAny = listings.length > 0;

  return (
    <Page width={900} top={56} gap={28}>
      {organisation.status === "more_evidence" || organisation.status === "rejected" ? (
        <Banner tone="warning" icon={<TriangleAlert size={20} strokeWidth={2} />}>
          <strong>
            {organisation.status === "rejected"
              ? "We could not verify you yet."
              : "We need one more thing to verify you."}
          </strong>{" "}
          Nothing you have written is lost. See{" "}
          <Link href="/organisation" className="font-bold underline">
            your organisation page
          </Link>{" "}
          for what we asked for.
        </Banner>
      ) : organisation.status !== "verified" ? (
        <Banner tone="info" icon={<Clock size={20} strokeWidth={2} />}>
          <strong>Verification in progress.</strong> We check every organisation
          before its listings can reach women. Posting and inviting colleagues
          open as soon as that is done.
        </Banner>
      ) : null}

      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[44px] font-normal leading-[1.1] tracking-[-0.01em]">
          {organisation.name}
        </h1>
        <span className="text-[16px] text-ink-70">{countLine(listings)}</span>
      </div>

      {hasAny ? (
        <>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
            {[
              { value: stats.views, label: "women saw your listings this month" },
              { value: stats.saves, label: "saved one to come back to" },
              { value: stats.clickthroughs, label: "went through to your site" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-card shadow-hairline bg-surface p-5"
              >
                <span className="font-display text-[34px] font-normal leading-none tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[14px] text-ink-65">{stat.label}</span>
              </div>
            ))}
          </div>

          {stale.length > 0 ? (
            <Banner
              tone="warning"
              icon={<TriangleAlert size={20} strokeWidth={2} />}
              action={<ConfirmFreshnessButton listingId={stale[0].id} />}
            >
              <strong>
                {stale.length === 1
                  ? "One listing needs checking."
                  : `${stale.length} listings need checking.`}
              </strong>{" "}
              We last confirmed {stale[0].name} on{" "}
              {stale[0].last_confirmed_at
                ? shortDate(stale[0].last_confirmed_at)
                : "never"}
              . Women see the date, so an old one costs you applications.
            </Banner>
          ) : null}

          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 self-start p-1 text-[16px] font-bold text-gold-700"
          >
            <span>See all your solutions</span>
            <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-card shadow-hairline bg-surface p-7">
          <span className="flex text-gold-500">
            <FilePlus2 size={32} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.6] text-ink-70">
            Nothing posted yet. A solution is one thing a woman can act on: a
            course, a grant, a drop-in, a mentoring place. Your figures start
            here once the first one is live.
          </p>
          {isVerified(organisation) ? (
            <ButtonLink href="/solutions/new" size="inline" className="px-7 py-4 text-[17px]">
              Post your first solution
            </ButtonLink>
          ) : null}
        </div>
      )}
    </Page>
  );
}
