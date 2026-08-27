"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { sendEmail } from "@/lib/email";
import { colleagueInvite } from "@/emails/colleague-invite";
import type { FormState } from "@/app/actions";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Add their email address.").email(),
});

/** Absolute origin for the emailed link, taken from the request host. */
async function origin() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * Invite a colleague.
 *
 * No account is created here, and none could be: this portal holds no service
 * role key. The invitation is a row keyed to an address, and the person
 * accepts it by signing in or signing up in the ordinary way. That also means
 * the two cases the sender might wonder about — colleague already has an
 * account, colleague does not — need no branch on this side at all.
 *
 * Re-inviting the same address replaces the pending row rather than leaving
 * two working links, so the most recent email is always the live one.
 */
export async function inviteColleague(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sign in first." };

  const organisation = await getMyOrganisation();
  if (!organisation) return { error: "Finish setting up your organisation first." };

  if (parsed.data.email === user.email?.toLowerCase()) {
    return { error: "That is your own address. You are already here." };
  }

  // 32 bytes of randomness. This is the only thing between a forwarded email
  // and a seat in the organisation, so it is not derived from anything.
  const token = randomBytes(32).toString("base64url");

  await supabase
    .from("organisation_invitations")
    .delete()
    .eq("organisation_id", organisation.id)
    .eq("email", parsed.data.email)
    .is("accepted_at", null);

  const { error } = await supabase.from("organisation_invitations").insert({
    organisation_id: organisation.id,
    email: parsed.data.email,
    token,
    invited_by: user.id,
  });

  if (error) return { error: error.message };

  const { subject, html, text } = colleagueInvite(
    organisation.name,
    `${await origin()}/invite/${token}`,
  );

  const sent = await sendEmail({ to: parsed.data.email, subject, html, text });

  if (!sent.ok) {
    // The row would otherwise sit there implying an email that never went,
    // and the sender would have no way of telling.
    await supabase
      .from("organisation_invitations")
      .delete()
      .eq("organisation_id", organisation.id)
      .eq("email", parsed.data.email)
      .is("accepted_at", null);

    console.error("colleague invite failed to send", sent.error);
    return { error: "We could not send that invitation. Check the address and try again." };
  }

  revalidatePath("/organisation");
  return null;
}

/** Withdraw an invitation that has not been accepted. */
export async function revokeInvitation(formData: FormData): Promise<void> {
  const id = String(formData.get("invitationId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("organisation_invitations")
    .delete()
    .eq("id", id)
    .is("accepted_at", null);

  revalidatePath("/organisation");
}
