import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, UserPlus } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation, getAccessZones } from "@/lib/data/organisations";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const ROW =
  "flex flex-wrap items-center justify-between gap-4 border-b border-hairline-soft py-4 last:border-b-0";

/**
 * Screen 13. Organisation.
 *
 * Verification status, the details women see beside every listing, and who
 * can post. There is no account-removal section, by decision.
 */
export default async function OrganisationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const zones = await getAccessZones();
  const primaryZone =
    zones.find((z) => z.id === organisation.primaryZoneId)?.name ?? "Not set";

  const verified = organisation.status === "verified";

  return (
    <Page width={660} top={56} gap={30}>
      <Link
        href="/dashboard"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        My solutions
      </Link>

      <h1 className="m-0 font-display text-[42px] font-medium leading-[1.1] tracking-[-0.01em]">
        Organisation
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          Verification
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-ring bg-surface px-[22px] py-5">
          <span
            className={`flex items-center gap-[10px] text-[16px] font-semibold ${
              verified ? "text-green-700" : "text-gold-700"
            }`}
          >
            <BadgeCheck size={18} strokeWidth={2} aria-hidden="true" />
            {verified
              ? `Verified · confirmed ${
                  organisation.verified_at
                    ? DATE.format(new Date(organisation.verified_at))
                    : "recently"
                }`
              : "Verification in progress"}
          </span>
          {/* Both routes reach a person. Neither is self-service. */}
          <Link
            href="/onboarding/verify"
            className="p-1 text-[15px] font-bold text-gold-700 no-underline"
          >
            {verified ? "View details" : "Chase this"}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          Details women see
        </h2>
        <div className="rounded-card border border-ring bg-surface px-[22px] py-1">
          {[
            { value: organisation.name, href: "/onboarding/about" },
            { value: organisation.place ?? "Not set", href: "/onboarding/about" },
            { value: primaryZone, href: "/onboarding/zones" },
          ].map((row) => (
            <div key={row.value} className={ROW}>
              <span className="text-[17px]">{row.value}</span>
              <Link
                href={row.href}
                className="p-1 text-[15px] font-bold text-gold-700 no-underline"
              >
                Change
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-60">
          Who can post
        </h2>
        <div className="rounded-card border border-ring bg-surface px-[22px] py-4">
          <span className="text-[17px]">
            {user.email} <span className="text-ink-60">· you</span>
          </span>
        </div>
        <button
          type="button"
          disabled
          title="Not built yet"
          className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 self-start rounded-control border border-ring bg-surface px-[18px] py-3 text-[15px] font-bold text-ink opacity-40"
        >
          <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
          Invite a colleague
        </button>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Anyone you invite can post and edit listings for this organisation.
          Verification stays with the organisation, not the person.
        </span>
      </section>
    </Page>
  );
}
