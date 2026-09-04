import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ProfileForm } from "@/components/organisations/ProfileForm";
import { getMyOrganisation } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";
import { profileGaps, andList, isProfileComplete } from "@/lib/profile";

export const metadata: Metadata = { title: "About your organisation" };

/**
 * The profile, in one long page rather than a second wizard.
 *
 * Onboarding is stepped because it is a stranger's first five minutes and
 * every step is a place to stop. This is the opposite situation: somebody
 * signed in, coming back to fill in what they know, often out of order. One
 * page they can scroll and one Save is the right shape for that.
 */
export default async function ProfilePage() {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const nextStep = onboardingNextStep(organisation);
  if (nextStep) redirect(nextStep);

  const gaps = profileGaps(organisation);
  // Before it is finished this is the only screen there is, so there is
  // nowhere to go back to and no link pretending otherwise.
  const required = !isProfileComplete(organisation);

  return (
    <Page width={820} top={56} gap={26}>
      {required ? null : (
        <Link
          href="/organisation"
          className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Your organisation
        </Link>
      )}

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          About {organisation.name}
        </h1>
        <p className="m-0 max-w-[64ch] text-[17px] leading-[1.55] text-ink-70">
          This is how we know you, and who to send you.
        </p>
      </div>

      {required ? (
        <p className="m-0 rounded-card border border-gold-300 bg-gold-200 px-[22px] py-4 text-[16px] leading-[1.5] text-gold-700">
          <strong>This is the last step.</strong> We are already checking you
          over in the background. Save this and the rest of the portal opens
          up.
          {organisation.profile_updated_at
            ? " Still to fill in: " + andList(gaps) + "."
            : ""}
        </p>
      ) : null}

      <ProfileForm organisation={organisation} />
    </Page>
  );
}
