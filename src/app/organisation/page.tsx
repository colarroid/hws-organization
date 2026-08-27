import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation, getAccessZones } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";
import { VerificationStatus } from "@/components/organisations/VerificationStatus";

const ROW =
  "flex flex-wrap items-center justify-between gap-4 border-b border-hairline-soft py-4 last:border-b-0";

export const metadata: Metadata = { title: "Organisation" };

/**
 * Screen 13. Organisation.
 *
 * Verification status, the details women see beside every listing, and who
 * can post. There is no account-removal section, by decision.
 */
export default async function OrganisationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  // Onboarding can be broken off after step 1, which is what creates the
  // organisation. Finish it before anything that assumes it is done.
  const nextStep = onboardingNextStep(organisation);
  if (nextStep) redirect(nextStep);

  const zones = await getAccessZones();
  const primaryZone =
    zones.find((z) => z.id === organisation.primaryZoneId)?.name ?? "Not set";

  return (
    <Page width={660} top={56} gap={30}>

      <h1 className="m-0 font-display text-[42px] font-normal leading-[1.1] tracking-[-0.01em]">
        Organisation
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 eyebrow text-ink-60">
          Verification
        </h2>
        <VerificationStatus
          status={organisation.status}
          verifiedAt={organisation.verified_at}
          reviewNote={organisation.review_note}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 eyebrow text-ink-60">
          Details women see
        </h2>
        <div className="rounded-card shadow-hairline bg-surface px-[22px] py-1">
          {[
            { value: organisation.name, href: "/onboarding/about" },
            { value: organisation.place ?? "Not set", href: "/onboarding/about" },
            { value: primaryZone, href: "/onboarding/zones" },
          ].map((row) => (
            <div key={row.value} className={ROW}>
              <span className="text-[17px]">{row.value}</span>
              <Link
                href={row.href}
                className="p-1 text-[15px] font-bold text-gold-700 no-underline"
              >
                Change
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 eyebrow text-ink-60">
          Who can post
        </h2>
        <div className="rounded-card shadow-hairline bg-surface px-[22px] py-4">
          <span className="text-[17px]">
            {user.email} <span className="text-ink-60">· you</span>
          </span>
        </div>
        <button
          type="button"
          disabled
          title="Not built yet"
          className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 self-start rounded-control shadow-hairline bg-surface px-[18px] py-3 text-[15px] font-bold text-ink opacity-40"
        >
          <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
          Invite a colleague
        </button>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Anyone you invite can post and edit listings for this organisation.
          Verification stays with the organisation, not the person.
        </span>
      </section>
    </Page>
  );
}
