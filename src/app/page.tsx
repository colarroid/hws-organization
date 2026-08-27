import { redirect } from "next/navigation";
import { getMyOrganisation } from "@/lib/data/organisations";
import { onboardingNextStep } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

/**
 * The root of the organisation portal.
 *
 * Signed out this is sign-in, not sign-up. Anyone arriving here already has
 * a reason to be here, and it is where the confirmation email lands if
 * anything goes wrong with the link. Showing "create an account" to someone
 * who just created one is how you get two accounts for one organisation.
 * Creating a first account is one tap from the sign-in screen.
 */
export default async function OrganisationsIndex() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Not "has an organisation, so it must be done". Step 1 creates the
  // organisation, so that test sent anyone who broke off after it to a
  // dashboard for a listing they could not yet publish.
  const organisation = await getMyOrganisation();
  redirect(onboardingNextStep(organisation) ?? "/dashboard");
}
