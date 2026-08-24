"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ORGANISATION_TYPES } from "@/lib/design/taxonomy";
import type { FormState } from "../actions";

const TYPE_SLUGS = ORGANISATION_TYPES.map((t) => t.slug) as [string, ...string[]];

const aboutSchema = z.object({
  name: z.string().trim().min(1, "Add your organisation's name."),
  type: z.enum(TYPE_SLUGS, {
    message: "Pick the kind of organisation you are.",
  }),
  website: z.string().trim().optional(),
  place: z.string().trim().optional(),
  blurb: z.string().trim().optional(),
});

/**
 * Step 1. Creates the organisation on first submit and updates it after.
 *
 * The signed-in user becomes its owner. Membership is separate from the
 * organisation record because verification stays with the organisation, not
 * the person, so an invited colleague inherits it.
 */
export async function saveAbout(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = aboutSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    website: formData.get("website"),
    place: formData.get("place"),
    blurb: formData.get("blurb"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const existingId = formData.get("organisationId");
  const fields = {
    name: parsed.data.name,
    type: parsed.data.type,
    website: parsed.data.website || null,
    place: parsed.data.place || null,
    blurb: parsed.data.blurb || null,
  };

  if (typeof existingId === "string" && existingId) {
    const { error } = await supabase
      .from("organisations")
      .update(fields)
      .eq("id", existingId);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("organisations")
      .insert(fields)
      .select("id")
      .single();

    if (error) return { error: error.message };

    const { error: memberError } = await supabase
      .from("organisation_members")
      .insert({
        organisation_id: data.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) return { error: memberError.message };
  }

  redirect("/onboarding/zones");
}

/**
 * Step 2. Writes the primary zone and up to two secondary zones.
 *
 * Rewritten wholesale rather than diffed, since the set is small and a
 * partial write would leave an organisation with two primaries.
 */
export async function saveZones(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const organisationId = String(formData.get("organisationId") ?? "");
  const primary = String(formData.get("primaryZone") ?? "");
  const also = formData.getAll("alsoZones").map(String).filter(Boolean);

  if (!organisationId) redirect("/onboarding/about");

  if (!primary) {
    return { error: "Choose your primary zone before continuing." };
  }
  if (also.length > 2) {
    return { error: "You can add at most two further zones." };
  }

  const supabase = await createClient();

  const { error: clearError } = await supabase
    .from("organisation_zones")
    .delete()
    .eq("organisation_id", organisationId);

  if (clearError) return { error: clearError.message };

  const { error } = await supabase.from("organisation_zones").insert([
    { organisation_id: organisationId, zone_id: primary, role: "primary" },
    ...also.map((zone_id) => ({
      organisation_id: organisationId,
      zone_id,
      role: "also" as const,
    })),
  ]);

  if (error) return { error: error.message };

  redirect("/onboarding/verify");
}

const verifySchema = z.object({
  registrationNumber: z.string().trim().optional(),
  funderNote: z.string().trim().optional(),
  contactName: z.string().trim().min(1, "Add your name."),
  contactRole: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
});

/**
 * Step 3. Records the evidence and leaves the organisation pending.
 *
 * Verification gates publishing, not access, so this redirects straight to
 * the dashboard and drafting starts immediately.
 */
export async function saveVerification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const organisationId = String(formData.get("organisationId") ?? "");
  if (!organisationId) redirect("/onboarding/about");

  const parsed = verifySchema.safeParse({
    registrationNumber: formData.get("registrationNumber"),
    funderNote: formData.get("funderNote"),
    contactName: formData.get("contactName"),
    contactRole: formData.get("contactRole"),
    contactPhone: formData.get("contactPhone"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organisations")
    .update({
      registration_number: parsed.data.registrationNumber || null,
      funder_note: parsed.data.funderNote || null,
      contact_name: parsed.data.contactName,
      contact_role: parsed.data.contactRole || null,
      contact_phone: parsed.data.contactPhone || null,
      status: "pending",
    })
    .eq("id", organisationId);

  if (error) return { error: error.message };

  redirect("/dashboard");
}
