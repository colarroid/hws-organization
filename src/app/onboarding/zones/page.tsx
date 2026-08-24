import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/organisations/OnboardingShell";
import { ZonesPicker } from "@/components/organisations/ZonesPicker";
import { getAccessZones, getMyOrganisation } from "@/lib/data/organisations";

export default async function ZonesPage() {
  const [organisation, zones] = await Promise.all([
    getMyOrganisation(),
    getAccessZones(),
  ]);

  if (!organisation) redirect("/onboarding/about");

  return (
    <OnboardingShell
      step={2}
      backHref="/onboarding/about"
      width={760}
      title="Where do you fit?"
      intro="Pick the one Access Zone that describes your main work. You can add up to two more that you work across."
    >
      <ZonesPicker
        zones={zones}
        organisationId={organisation.id}
        primaryZoneId={organisation.primaryZoneId}
        alsoZoneIds={organisation.alsoZoneIds}
      />
    </OnboardingShell>
  );
}
