"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { SOLUTION_KINDS, COSTS, FORMATS } from "@/lib/design/taxonomy";
import type { FormState } from "../actions";

const slugs = (v: readonly { slug: string }[]) => v.map((x) => x.slug);

const solutionSchema = z.object({
  name: z.string().trim().min(1, "Give the solution a name."),
  kind: z.enum(slugs(SOLUTION_KINDS) as [string, ...string[]]).nullable(),
  blurb: z.string().trim(),
  whoFor: z.string().trim(),
  whatToExpect: z.string().trim(),
  cost: z.enum(slugs(COSTS) as [string, ...string[]]).nullable(),
  formats: z.array(z.enum(slugs(FORMATS) as [string, ...string[]])),
  place: z.string().trim(),
  deadline: z.string().trim(),
  applyUrl: z.string().trim(),
  situations: z.array(z.string().uuid()),
});

function readForm(formData: FormData) {
  const optional = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value ? value : null;
  };

  return solutionSchema.safeParse({
    name: formData.get("name") ?? "",
    kind: optional("kind"),
    blurb: formData.get("blurb") ?? "",
    whoFor: formData.get("whoFor") ?? "",
    whatToExpect: formData.get("whatToExpect") ?? "",
    cost: optional("cost"),
    formats: formData.getAll("formats").map(String),
    place: formData.get("place") ?? "",
    deadline: formData.get("deadline") ?? "",
    applyUrl: formData.get("applyUrl") ?? "",
    situations: formData.getAll("situations").map(String),
  });
}

/**
 * Writes the listing and its situation tags.
 *
 * Everything except the name is allowed through empty. The preview screen
 * names the gaps and review catches what is left, which is deliberate: a
 * form that blocks on every field gets abandoned, and a warning that
 * explains the consequence for a woman does more than a required attribute.
 */
async function save(formData: FormData) {
  const parsed = readForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const id = String(formData.get("listingId") ?? "");
  const fields = {
    name: parsed.data.name,
    kind: parsed.data.kind,
    blurb: parsed.data.blurb || null,
    who_for: parsed.data.whoFor || null,
    what_to_expect: parsed.data.whatToExpect || null,
    cost: parsed.data.cost,
    formats: parsed.data.formats,
    place: parsed.data.place || null,
    deadline: parsed.data.deadline || null,
    apply_url: parsed.data.applyUrl || null,
  };

  let listingId = id;

  if (listingId) {
    const { error } = await supabase
      .from("listings")
      .update(fields)
      .eq("id", listingId);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...fields,
        organisation_id: organisation.id,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    listingId = data.id;
  }

  // Rewritten wholesale. The set is small, and a partial write would leave
  // the listing matching on tags the organisation had just removed.
  await supabase.from("listing_situations").delete().eq("listing_id", listingId);

  if (parsed.data.situations.length > 0) {
    const { error } = await supabase.from("listing_situations").insert(
      parsed.data.situations.map((situation_id) => ({
        listing_id: listingId,
        situation_id,
      })),
    );
    if (error) return { error: error.message };
  }

  return { listingId };
}

/**
 * Both buttons on the form post here.
 *
 * Which one was pressed arrives as `intent`, because a clicked submit
 * button's own name and value are part of the form data. That keeps one
 * action bound to the form, so validation errors have somewhere to land
 * whichever button sent them.
 */
export async function saveSolution(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await save(formData);
  if ("error" in result) return result;

  // Both, since the figures live on Overview and the listing itself lives
  // on My solutions.
  revalidatePath("/dashboard");
  revalidatePath("/solutions");

  if (formData.get("intent") === "draft") redirect("/solutions");

  redirect(`/solutions/${result.listingId}/preview`);
}

/**
 * Submit for review.
 *
 * Listings are reviewed before going live. The verified stamp on the
 * woman-facing side is the platform's whole trust mechanism, and it means
 * nothing if organisations self-publish, so this never sets 'live'.
 */
export async function submitForReview(listingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { error: auditError } = await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    actor_id: user.id,
    action: "submitted",
  });

  if (auditError) {
    throw new Error(`Could not record the submission: ${auditError.message}`);
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "in_review" })
    .eq("id", listingId);

  if (error) throw new Error(`Could not submit the listing: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/solutions");
  redirect("/solutions/submitted");
}
