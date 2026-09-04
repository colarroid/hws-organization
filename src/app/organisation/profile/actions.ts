"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { normaliseWebsite } from "@/lib/website";
import { EXTENSION, sniffImageType } from "@/lib/image";
import {
  AUDIENCES,
  AVAILABILITY,
  COSTS,
  COVERAGE,
  FORMATS,
  POSTING_FREQUENCY,
  SOLUTION_KINDS,
} from "@/lib/design/taxonomy";
import type { FormState } from "@/app/actions";

const slugs = (vocabulary: readonly { slug: string }[]) =>
  new Set(vocabulary.map((entry) => entry.slug));

/**
 * Only slugs this build knows.
 *
 * The check constraints in the database say the same thing, and they are the
 * ones that actually hold. This is here so an unknown slug comes back as a
 * sentence rather than as a constraint violation with a column name in it.
 */
function known(values: FormDataEntryValue[], vocabulary: readonly { slug: string }[]) {
  const allowed = slugs(vocabulary);
  return values.map(String).filter((value) => allowed.has(value));
}

function one(
  value: FormDataEntryValue | null,
  vocabulary: readonly { slug: string }[],
) {
  const slug = String(value ?? "");
  return slugs(vocabulary).has(slug) ? slug : null;
}

/** Trimmed, or null. An empty box and an unanswered question are the same. */
function text(value: FormDataEntryValue | null, max = 2000) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

const MAX_LOGO_BYTES = 512 * 1024;

const dataUrlSchema = z
  .string()
  .regex(/^data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=]+$/i);

/**
 * The organisation's profile.
 *
 * Everything is optional. A profile filled in over three sittings is the
 * normal case, and a form that refuses to save until it is complete is a form
 * that gets abandoned on the second sitting.
 *
 * The logo arrives as a data URL whether it was uploaded or fetched, and it
 * is only written to storage here. Until save, an abandoned page has left
 * nothing behind.
 */
export async function saveProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const supabase = await createClient();

  const website = normaliseWebsite(String(formData.get("website") ?? ""));
  if (!website.ok) return { error: website.error };

  let logoPath = organisation.logo_path;
  let logoSource = organisation.logo_source;

  if (formData.get("logoRemoved")) {
    logoPath = null;
    logoSource = null;
  }

  const logoData = String(formData.get("logoData") ?? "");

  if (logoData) {
    if (!dataUrlSchema.safeParse(logoData).success) {
      return { error: "That logo could not be read. Try uploading it again." };
    }

    const bytes = Buffer.from(logoData.slice(logoData.indexOf(",") + 1), "base64");
    if (bytes.byteLength === 0) {
      return { error: "That logo file is empty." };
    }
    if (bytes.byteLength > MAX_LOGO_BYTES) {
      return { error: "That logo is over 512 KB. A smaller file will look the same." };
    }

    // The bytes decide, not the label on them. A file named logo.png is a PNG
    // only if it starts like one, and half the icons on the web are served
    // under a content type that has nothing to do with what they are.
    const contentType = sniffImageType(bytes);
    if (!contentType) {
      return { error: "That file is not an image we can use. PNG, JPEG, WebP, SVG or ICO." };
    }
    const extension = EXTENSION[contentType];

    // Under the organisation's own id, which is what the bucket policy checks,
    // and named by time so a replacement is never served from a cache of the
    // one it replaced.
    const path = `${organisation.id}/logo-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("organisation-logos")
      .upload(path, bytes, { contentType, upsert: false });

    if (error) return { error: `Your logo did not save: ${error.message}` };

    const previous = organisation.logo_path;
    logoPath = path;
    logoSource = String(formData.get("logoSource") ?? "") === "uploaded"
      ? "uploaded"
      : "fetched";

    // After the new one is safely up, so a failed upload never leaves the
    // organisation with no logo at all.
    if (previous && previous !== path) {
      await supabase.storage.from("organisation-logos").remove([previous]);
    }
  }

  const coverage = one(formData.get("coverage"), COVERAGE);
  const availability = one(formData.get("availability"), AVAILABILITY);
  const audiences = known(formData.getAll("audiences"), AUDIENCES);
  const costOptions = known(formData.getAll("costOptions"), COSTS);

  const { error } = await supabase
    .from("organisations")
    .update({
      website: website.value,
      mission: text(formData.get("mission")),
      unique_offer: text(formData.get("uniqueOffer")),
      audiences,
      // Dropped rather than kept when the question that produced it is no
      // longer on screen, so nothing invisible is saved on the woman's behalf.
      audiences_other: audiences.includes("any_woman")
        ? null
        : text(formData.get("audiencesOther"), 400),
      service_kinds: known(formData.getAll("serviceKinds"), SOLUTION_KINDS),
      access_routes: known(formData.getAll("accessRoutes"), FORMATS),
      cost_options: costOptions,
      cost_note: costOptions.includes("there_is_a_cost")
        ? text(formData.get("costNote"), 400)
        : null,
      coverage,
      coverage_note:
        coverage && coverage !== "scotland_wide" && coverage !== "online_only"
          ? text(formData.get("coverageNote"), 400)
          : null,
      eligibility: text(formData.get("eligibility")),
      not_eligible: text(formData.get("notEligible")),
      posting_frequency: one(formData.get("postingFrequency"), POSTING_FREQUENCY),
      availability,
      availability_note:
        availability === "term_time" || availability === "seasonal"
          ? text(formData.get("availabilityNote"), 400)
          : null,
      logo_path: logoPath,
      logo_source: logoSource,
      profile_updated_at: new Date().toISOString(),
    })
    .eq("id", organisation.id);

  if (error) return { error: error.message };

  revalidatePath("/organisation");
  revalidatePath("/organisation/profile");
  revalidatePath("/dashboard");
  redirect("/organisation?saved=profile");
}
