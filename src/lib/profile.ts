import type { MyOrganisation } from "@/lib/data/organisations";

/**
 * What the profile is still missing.
 *
 * Not a validator: the form saves whatever is there, and half a profile is a
 * normal state rather than an error. This is what drives the nudge on the
 * dashboard and the completeness line an admin reads before verifying, so it
 * lists only the answers that change what the platform can do — who they
 * serve, where they reach, what it costs, how often they show up.
 *
 * The logo is deliberately not on the list. A missing logo is cosmetic, and
 * putting it beside "who can you help" would say they were the same weight.
 */
export function profileGaps(organisation: MyOrganisation): string[] {
  const gaps: string[] = [];

  if (!organisation.mission) gaps.push("your mission");
  if (organisation.audiences.length === 0) gaps.push("who you work with");
  if (organisation.service_kinds.length === 0) gaps.push("what you offer");
  if (organisation.access_routes.length === 0) gaps.push("how women reach you");
  if (organisation.cost_options.length === 0) gaps.push("what it costs");
  if (!organisation.coverage) gaps.push("how far you reach");
  if (!organisation.eligibility) gaps.push("who you can help");
  if (!organisation.posting_frequency) gaps.push("how often you post");

  return gaps;
}

export function isProfileComplete(organisation: MyOrganisation): boolean {
  return profileGaps(organisation).length === 0;
}

/** "a, b and c" — for a sentence rather than a list. */
export function andList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
