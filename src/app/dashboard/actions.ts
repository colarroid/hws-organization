"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * "Still accurate" on the freshness banner.
 *
 * Stamps the confirmation date women see on the result card, and leaves a
 * row in the audit trail so the re-confirmation cadence is evidenced rather
 * than asserted.
 */
export async function confirmFreshness(listingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // The audit row goes first. A confirmation that clears the banner without
  // leaving a record is worse than no confirmation, because the six-monthly
  // re-check is one of the three mechanisms holding up the verified stamp.
  const { error: auditError } = await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    actor_id: user.id,
    action: "reconfirmed",
    note: "Confirmed as still accurate from the dashboard prompt.",
  });

  if (auditError) {
    throw new Error(`Could not record the confirmation: ${auditError.message}`);
  }

  const { error } = await supabase
    .from("listings")
    .update({ last_confirmed_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    throw new Error(`Could not update the listing: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/solutions");
}
