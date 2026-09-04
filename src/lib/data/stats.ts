import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * The figures on the overview.
 *
 * Read from `organisation_stats`, which counts calendar weeks and calendar
 * months rather than rolling windows, because the screen says "this week"
 * and "this month". A rolling seven days answers a question nobody asked and
 * makes Monday's figure smaller than Sunday's for no reason anyone can see.
 *
 * "Reached" is clickthroughs: a woman who went on to the organisation's own
 * site or application. Views are counted separately and shown per listing,
 * because a view is somebody reading a card and reaching somebody is not.
 */

export type Period = "week" | "month" | "all";

export const PERIODS: { slug: Period; label: string }[] = [
  { slug: "week", label: "This week" },
  { slug: "month", label: "This month" },
  { slug: "all", label: "All time" },
];

export function periodFrom(value: string | undefined): Period {
  return value === "week" || value === "all" ? value : "month";
}

export type OrganisationStats = {
  reached: number;
  seen: number;
  profileViews: number;
};

export const NO_ORGANISATION_STATS: OrganisationStats = {
  reached: 0,
  seen: 0,
  profileViews: 0,
};

export async function getOrganisationStats(
  organisationId: string,
  period: Period,
): Promise<OrganisationStats> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organisation_stats")
    .select("*")
    .eq("organisation_id", organisationId)
    .maybeSingle();

  if (!data) return NO_ORGANISATION_STATS;

  const suffix = period === "all" ? "all" : period === "week" ? "week" : "month";

  return {
    reached: data[`reached_${suffix}`] ?? 0,
    seen: data[`seen_${suffix}`] ?? 0,
    profileViews: data[`profile_views_${suffix}`] ?? 0,
  };
}
