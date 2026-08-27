import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { SolutionForm } from "@/components/organisations/SolutionForm";
import { getMyOrganisation, getSituations } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Post a solution" };

export default async function NewSolutionPage() {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  // Onboarding can be broken off after step 1, which is what creates the
  // organisation. Finish it before anything that assumes it is done.
  const nextStep = onboardingNextStep(organisation);
  if (nextStep) redirect(nextStep);

  const situations = await getSituations();

  return (
    <Page width={720} top={56} gap={28}>
      <Link
        href="/solutions"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        My solutions
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[42px] font-normal leading-[1.1] tracking-[-0.01em]">
          Post a solution
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Everything here is what a woman reads before she decides. Write it for
          someone who has never heard of your organisation.
        </p>
      </div>

      <SolutionForm situations={situations} />
    </Page>
  );
}
