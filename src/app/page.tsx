import { redirect } from "next/navigation";

/** The organisation subdomain opens on the sign-up screen. */
export default function OrganisationsIndex() {
  redirect("/sign-up");
}
