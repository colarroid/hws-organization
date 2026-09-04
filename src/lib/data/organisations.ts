import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AccessZone = {
  id: string;
  slug: string;
  name: string;
  focus: string;
};

/**
 * The Access Zones, in admin-set order.
 *
 * Comes from the database rather than a constant, because an HWS admin can
 * add, rename, re-describe or retire one without a release. Retired zones are
 * filtered out by RLS, so a retired zone stops being offered without any
 * change here.
 */
export async function getAccessZones(): Promise<AccessZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_zones")
    .select("id, slug, name, focus")
    .is("retired_at", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export type MyOrganisation = {
  id: string;
  name: string;
  /** One or more, since an organisation is often more than one thing. */
  types: string[];
  website: string | null;
  place: string | null;
  blurb: string | null;
  status: string;
  verified_at: string | null;
  /** Set only by onboarding step 3, so it doubles as "verification submitted". */
  contact_name: string | null;
  /** What HWS last said, when they asked for more or declined. */
  review_note: string | null;
  primaryZoneId: string | null;
  alsoZoneIds: string[];

  // The profile. Every field optional: a half-finished profile is a normal
  // state, and the form saves without demanding the rest.
  mission: string | null;
  unique_offer: string | null;
  audiences: string[];
  audiences_other: string | null;
  service_kinds: string[];
  access_routes: string[];
  cost_options: string[];
  cost_note: string | null;
  coverage: string | null;
  coverage_note: string | null;
  eligibility: string | null;
  not_eligible: string | null;
  posting_frequency: string | null;
  availability: string | null;
  availability_note: string | null;
  /** Object path in the organisation-logos bucket, never a remote URL. */
  logo_path: string | null;
  logo_source: string | null;
  profile_updated_at: string | null;
  /** Set once, when the profile was first completed. Null means not in the queue. */
  verification_requested_at: string | null;
  /** Derived from logo_path. Null when they have not set one. */
  logoUrl: string | null;
};

/** The organisation the signed-in user belongs to, if any. */
export async function getMyOrganisation(): Promise<MyOrganisation | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return null;

  const { data: org } = await supabase
    .from("organisations")
    .select(
      `id, name, types, website, place, blurb, status, verified_at, review_note,
       contact_name, mission, unique_offer, audiences, audiences_other,
       service_kinds, access_routes, cost_options, cost_note, coverage,
       coverage_note, eligibility, not_eligible, posting_frequency,
       availability, availability_note, logo_path, logo_source,
       profile_updated_at, verification_requested_at`,
    )
    .eq("id", membership.organisation_id)
    .single();

  if (!org) return null;

  const { data: zones } = await supabase
    .from("organisation_zones")
    .select("zone_id, role")
    .eq("organisation_id", org.id);

  return {
    ...org,
    types: org.types ?? [],
    logoUrl: logoUrl(supabase, org.logo_path),
    audiences: org.audiences ?? [],
    service_kinds: org.service_kinds ?? [],
    access_routes: org.access_routes ?? [],
    cost_options: org.cost_options ?? [],
    primaryZoneId: zones?.find((z) => z.role === "primary")?.zone_id ?? null,
    alsoZoneIds: (zones ?? [])
      .filter((z) => z.role === "also")
      .map((z) => z.zone_id),
  };
}

export type Situation = {
  id: string;
  slug: string;
  label: string;
};

/**
 * The situation chips an organisation can tag a listing with.
 *
 * `woman_only` is excluded: "Prefer not to say" is an answer she can give on
 * question 3, never a tag a listing can hold. Both sides read this one table,
 * so the lists cannot drift apart.
 */
export async function getSituations(): Promise<Situation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("situations")
    .select("id, slug, label")
    .eq("woman_only", false)
    .is("retired_at", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * The public URL for a logo, or null.
 *
 * The bucket is public, so this is string building rather than a request, and
 * it is done here so no screen has to know the bucket's name.
 */
function logoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("organisation-logos").getPublicUrl(path);
  return data.publicUrl;
}
