import { COSTS, FORMATS, SOLUTION_KINDS, labelFor } from "@/lib/design/taxonomy";
import type { Listing } from "@/lib/data/listings";

/**
 * The two sentences the portal writes about a listing.
 *
 * Shared because Overview and My solutions became separate screens and both
 * describe the same listings. One copy, so the two cannot drift into saying
 * the same thing differently.
 */

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
});

/** "Course · Free · In person, Bathgate · Closes 5 October" */
export function metaLine(listing: Listing): string {
  // An online-only listing usually has "Online" as its place too, and the
  // meta line should not say it twice.
  const parts = [
    ...listing.formats.map((f) => labelFor(FORMATS, f)),
    listing.place ?? "",
  ].filter(Boolean);

  const seen = new Set<string>();
  const where = parts
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(", ");

  const when = listing.deadline
    ? `${listing.status === "closed" ? "Closed" : "Closes"} ${DATE.format(new Date(listing.deadline))}`
    : "Runs all year";

  return [labelFor(SOLUTION_KINDS, listing.kind), labelFor(COSTS, listing.cost), where, when]
    .filter(Boolean)
    .join(" · ");
}

/** "Two live, one in review, one closed." */
export function countLine(listings: Listing[]): string {
  if (listings.length === 0) return "Nothing posted yet.";

  const counts = {
    live: listings.filter((l) => l.status === "live").length,
    review: listings.filter(
      (l) => l.status === "in_review" || l.status === "changes_requested",
    ).length,
    draft: listings.filter((l) => l.status === "draft").length,
    closed: listings.filter((l) => l.status === "closed").length,
  };

  const parts = [
    counts.live && `${counts.live} live`,
    counts.review && `${counts.review} in review`,
    counts.draft && `${counts.draft} in draft`,
    counts.closed && `${counts.closed} closed`,
  ].filter(Boolean);

  return `${parts.join(", ")}.`;
}

/** "5 October", for the freshness prompt. */
export function shortDate(value: string) {
  return DATE.format(new Date(value));
}
