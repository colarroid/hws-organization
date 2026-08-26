import { redirect } from "next/navigation";
import { getMyOrganisation } from "@/lib/data/organisations";
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

  const organisation = await getMyOrganisation();
  redirect(organisation ? "/dashboard" : "/onboarding/about");
}
