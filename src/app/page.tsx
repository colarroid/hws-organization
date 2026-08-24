import { redirect } from "next/navigation";
import { getMyOrganisation } from "@/lib/data/organisations";
import { createClient } from "@/lib/supabase/server";

/**
 * The root of the organisation portal.
 *
 * Signed out, this is the sign-up screen. Signed in it is the dashboard, or
 * onboarding if that was never finished. Sending a signed-in organisation to
 * "create an account" is how you get duplicate accounts for one organisation.
 */
export default async function OrganisationsIndex() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-up");

  const organisation = await getMyOrganisation();
  redirect(organisation ? "/dashboard" : "/onboarding/about");
}
