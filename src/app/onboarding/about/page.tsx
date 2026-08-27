import type { Metadata } from "next";
import { OnboardingShell } from "@/components/organisations/OnboardingShell";
import { AboutForm } from "@/components/organisations/AboutForm";
import { getMyOrganisation } from "@/lib/data/organisations";

export const metadata: Metadata = { title: "About your organisation" };

export default async function AboutPage() {
  const organisation = await getMyOrganisation();

  return (
    <OnboardingShell
      step={1}
      backHref="/sign-up"
      width={660}
      title="About your organisation"
      intro="This is what women see next to every solution you post."
    >
      <AboutForm organisation={organisation} />
    </OnboardingShell>
  );
}
