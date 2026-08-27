import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, FilePlus2, TriangleAlert } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Banner } from "@/components/organisations/Banner";
import { ConfirmFreshnessButton } from "@/components/organisations/ConfirmFreshnessButton";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";
import {
  getListings,
  getStatsByListing,
  sumStats,
  staleListings,
  NO_STATS,
  type Listing,
} from "@/lib/data/listings";
import {
  COSTS,
  FORMATS,
  SOLUTION_KINDS,
  labelFor,
} from "@/lib/design/taxonomy";

const TABS = ["All", "Live", "In review", "Closed"] as const;
type Tab = (typeof TABS)[number];

const TAB_MATCHES: Record<Tab, (l: Listing) => boolean> = {
  All: () => true,
  Live: (l) => l.status === "live",
  "In review": (l) => l.status === "in_review" || l.status === "changes_requested",
  Closed: (l) => l.status === "closed",
};

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
});

/** "Course · Free · In person, Bathgate · Closes 5 October" */
function metaLine(listing: Listing): string {
  // An online-only listing usually has "Online" as its place too, and the
  // meta line should not say it twice.
  const parts = [
    ...listing.formats.map((f) => labelFor(FORMATS, f)),
    listing.place ?? "",
  ].filter(Boolean);

  const seen = new Set<string>();
  const where = parts
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(", ");

  const when = listing.deadline
    ? `${listing.status === "closed" ? "Closed" : "Closes"} ${DATE.format(new Date(listing.deadline))}`
    : "Runs all year";

  return [labelFor(SOLUTION_KINDS, listing.kind), labelFor(COSTS, listing.cost), where, when]
    .filter(Boolean)
    .join(" · ");
}

/** "Two live, one in review, one closed." */
function countLine(listings: Listing[]): string {
  if (listings.length === 0) return "Nothing posted yet.";

  const counts = {
    live: listings.filter((l) => l.status === "live").length,
    review: listings.filter(
      (l) => l.status === "in_review" || l.status === "changes_requested",
    ).length,
    draft: listings.filter((l) => l.status === "draft").length,
    closed: listings.filter((l) => l.status === "closed").length,
  };

  const parts = [
    counts.live && `${counts.live} live`,
    counts.review && `${counts.review} in review`,
    counts.draft && `${counts.draft} in draft`,
    counts.closed && `${counts.closed} closed`,
  ].filter(Boolean);

  return `${parts.join(", ")}.`;
}

const TAB_PILL =
  "inline-flex min-h-[44px] items-center rounded-full px-[18px] py-[10px] text-[15px] no-underline";

export const metadata: Metadata = { title: "My solutions" };

/**
 * Screen 9. Dashboard.
 *
 * Order is fixed by the handoff: verification banner, heading, stats,
 * freshness banner, tabs, then the listings.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
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

  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "All";

  const stale = staleListings(listings);
  const visible = listings.filter(TAB_MATCHES[tab]);
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
          <strong>Verification in progress.</strong> You can draft and submit
          solutions now. They publish as soon as we confirm your details.
        </Banner>
      ) : null}

      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[44px] font-normal leading-[1.1] tracking-[-0.01em]">
          {hasAny ? "My solutions" : organisation.name}
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
                <span className="font-display text-[34px] font-normal leading-none">
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
                ? DATE.format(new Date(stale[0].last_confirmed_at))
                : "never"}
              . Women see the date, so an old one costs you applications.
            </Banner>
          ) : null}

          <nav aria-label="Filter by status" className="flex flex-wrap gap-[10px]">
            {TABS.map((label) => {
              const active = label === tab;
              return (
                <Link
                  key={label}
                  href={label === "All" ? "/dashboard" : `/dashboard?tab=${encodeURIComponent(label)}`}
                  aria-current={active ? "page" : undefined}
                  className={`${TAB_PILL} ${
                    active
                      ? "bg-ink font-semibold text-white"
                      : "shadow-hairline bg-surface font-semibold text-ink transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-[14px]">
            {visible.map((listing) => (
              <article
                key={listing.id}
                className="flex flex-col gap-[14px] rounded-card shadow-hairline bg-surface p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex flex-col gap-2">
                    <StatusPill status={listing.status} />
                    <span className="font-display text-[20px] font-normal leading-[1.3]">
                      {listing.name}
                    </span>
                    <span className="text-[15px] text-ink-65">
                      {metaLine(listing)}
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <ButtonLink
                      href={`/solutions/${listing.id}/edit`}
                      variant="secondary"
                      size="inline"
                    >
                      Edit
                    </ButtonLink>
                    <ButtonLink
                      href={`/solutions/${listing.id}/preview`}
                      variant="secondary"
                      size="inline"
                    >
                      Preview
                    </ButtonLink>
                  </div>
                </div>

                {listing.status === "live" ? (
                  <div className="flex flex-wrap gap-8 border-t border-hairline-soft pt-[14px]">
                    {(() => {
                      const s = statsByListing[listing.id] ?? NO_STATS;
                      return [
                        [s.views, "women saw this"],
                        [s.saves, "saved it"],
                        [s.clickthroughs, "went to your site"],
                      ] as const;
                    })().map(([value, label]) => (
                      <span key={label} className="text-[15px]">
                        <strong>{value}</strong>{" "}
                        <span className="text-ink-65">{label}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {visible.length === 0 ? (
              <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
                Nothing under {tab.toLowerCase()} right now.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        /* The definition here is the most important copy in the organisation
           flow. Organisations naturally bundle everything into one listing,
           which destroys matching. */
        <div className="flex max-w-[62ch] flex-col items-start gap-[18px] rounded-card-lg shadow-hairline bg-surface p-11">
          <span className="flex text-gold-500">
            <FilePlus2 size={30} strokeWidth={2} aria-hidden="true" />
          </span>
          <h2 className="m-0 font-display text-[28px] font-normal leading-[1.2]">
            Post your first solution
          </h2>
          <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
            A solution is one thing a woman can act on: a course, a grant, a
            drop-in, an advice line. Post them separately rather than as one
            listing, so each can be matched to the woman who needs it.
          </p>
          <ButtonLink href="/solutions/new" size="inline" className="px-[30px] py-4 text-[17px]">
            Post a solution
          </ButtonLink>
        </div>
      )}
    </Page>
  );
}
