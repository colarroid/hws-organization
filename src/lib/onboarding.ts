import type { MyOrganisation } from "@/lib/data/organisations";

/**
 * The onboarding screen still owed, or null once all three are done.
 *
 * Derived from what was actually saved rather than from a flag, so it cannot
 * drift from the truth and there is no extra column to keep in step:
 *
 * - step 1 wrote the organisation, so its existence is the proof
 * - step 2 wrote the zones, so a primary zone is the proof
 * - step 3 wrote the verification contact, and `contact_name` is required
 *   there and null on creation, so it is the proof
 *
 * Status cannot stand in for step 3. An organisation is created `pending` and
 * verification leaves it `pending`, so the two are indistinguishable.
 *
 * Callers must not use this to guard the onboarding screens themselves: on
 * the screen it names, it would redirect to where it already is.
 */
export function onboardingNextStep(
  organisation: MyOrganisation | null,
): string | null {
  if (!organisation) return "/onboarding/about";
  if (!organisation.primaryZoneId) return "/onboarding/zones";
  if (!organisation.contact_name) return "/onboarding/verify";
  return null;
}
