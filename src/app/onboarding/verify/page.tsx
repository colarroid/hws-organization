import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/organisations/OnboardingShell";
import { VerifyForm } from "@/components/organisations/VerifyForm";
import { getMyOrganisation } from "@/lib/data/organisations";

export const metadata: Metadata = { title: "Let us verify you" };

export default async function VerifyPage() {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  return (
    <OnboardingShell
      step={3}
      backHref="/onboarding/zones"
      width={620}
      title="Let us verify you"
      intro="Every listing carries a verified stamp. It is the reason women trust what they find here, so we check each organisation once before you publish."
    >
      <VerifyForm organisationId={organisation.id} />
    </OnboardingShell>
  );
}
