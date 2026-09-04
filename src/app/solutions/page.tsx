import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, FilePlus2 } from "lucide-react";
import { Banner } from "@/components/organisations/Banner";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { isVerified, nextRequiredStep } from "@/lib/onboarding";
import {
  getListings,
  getStatsByListing,
  NO_STATS,
  type Listing,
} from "@/lib/data/listings";
import { countLine, metaLine } from "@/lib/design/listing-copy";

const TABS = ["All", "Live", "In review", "Closed"] as const;
type Tab = (typeof TABS)[number];

const TAB_MATCHES: Record<Tab, (l: Listing) => boolean> = {
  All: () => true,
  Live: (l) => l.status === "live",
  "In review": (l) => l.status === "in_review" || l.status === "changes_requested",
  Closed: (l) => l.status === "closed",
};

const TAB_PILL =
  "inline-flex min-h-[44px] items-center rounded-full px-[18px] py-[10px] text-[15px] no-underline";

export const metadata: Metadata = { title: "My solutions" };

/**
 * The listings themselves, split out of the dashboard when the rail arrived.
 *
 * Overview answers "how are things", this answers "what have I posted". They
 * were one screen because there was one place to be; with a rail there are
 * three, and a page that scrolls past its own figures to reach the list is
 * the wrong shape for the thing returned to most.
 */
export default async function SolutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; blocked?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const nextStep = nextRequiredStep(organisation);
  if (nextStep) redirect(nextStep);

  const listings = await getListings(organisation.id);
  const statsByListing = await getStatsByListing(listings.map((l) => l.id));

  const { tab: rawTab, blocked } = await searchParams;
  const verified = isVerified(organisation);
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "All";
  const visible = listings.filter(TAB_MATCHES[tab]);
  const hasAny = listings.length > 0;

  return (
    <Page width={900} top={56} gap={28}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[44px] font-normal leading-[1.1] tracking-[-0.01em]">
            My solutions
          </h1>
          <span className="text-[16px] text-ink-70">{countLine(listings)}</span>
        </div>
        {hasAny && verified ? (
          <ButtonLink href="/solutions/new" size="inline" className="px-6 py-[14px] text-[16px]">
            Post a solution
          </ButtonLink>
        ) : null}
      </div>

      {!verified ? (
        <Banner
          tone="info"
          icon={<Clock size={20} strokeWidth={2} />}
          title={
            blocked === "verification"
              ? "You cannot post a solution yet"
              : "Verification in progress"
          }
        >
          We check every organisation before its listings can reach women.
          Posting opens as soon as that is done, and nothing is asked of you in
          the meantime.
        </Banner>
      ) : null}

      {hasAny ? (
        <>
          <nav aria-label="Filter by status" className="flex flex-wrap gap-[10px]">
            {TABS.map((label) => {
              const active = label === tab;
              return (
                <Link
                  key={label}
                  href={label === "All" ? "/solutions" : `/solutions?tab=${encodeURIComponent(label)}`}
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
                    <StatusPill
                      status={listing.status}
                      hidden={Boolean(listing.hidden_at)}
                    />
                    <span className="font-display text-[20px] font-normal leading-[1.3]">
                      {listing.name}
                    </span>
                    <span className="text-[15px] text-ink-65">{metaLine(listing)}</span>
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

                {listing.hidden_at ? (
                  <div className="flex flex-col gap-[6px] rounded-control border border-red-200 bg-red-50 px-4 py-[14px]">
                    <span className="text-[15px] font-bold text-red-700">
                      Taken down while something is sorted
                    </span>
                    <span className="text-[15px] leading-[1.6] text-red-700">
                      {listing.hidden_reason ??
                        "No reason was recorded. Reply to any email from us and we will explain."}
                    </span>
                    <span className="text-[14px] leading-[1.6] text-red-700">
                      Nothing is lost. Edit it and reply to us, and it goes back
                      in front of women.
                    </span>
                  </div>
                ) : null}

                {listing.status === "live" && !listing.hidden_at ? (
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
              <p className="m-0 rounded-card shadow-hairline bg-surface p-6 text-[16px] leading-[1.6] text-ink-70">
                Nothing under {tab.toLowerCase()} yet.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-card shadow-hairline bg-surface p-7">
          <span className="flex text-gold-500">
            <FilePlus2 size={32} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.6] text-ink-70">
            A solution is one thing a woman can act on: a course, a grant, a
            drop-in, a mentoring place. Post them separately rather than
            bundling them, so each can be matched to the women it suits.
          </p>
          {verified ? (
            <ButtonLink href="/solutions/new" size="inline" className="px-7 py-4 text-[17px]">
              Post your first solution
            </ButtonLink>
          ) : null}
        </div>
      )}
    </Page>
  );
}
