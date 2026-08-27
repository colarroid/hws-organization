import Image from "next/image";
import Link from "next/link";
import { Building2, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { MobileNav } from "@/components/ui/MobileNav";
import { signOut } from "@/app/actions";

type OrgHeaderProps = {
  /** A session exists. Enough on its own to offer a way out. */
  signedIn?: boolean;
  /**
   * Onboarding is far enough along for the nav to have somewhere to point.
   * Separate from `signedIn`, so someone mid-onboarding still gets sign-out.
   */
  hasOrganisation?: boolean;
  /** Live listing count, shown as a pill beside "My solutions". */
  liveCount?: number;
};

/**
 * Shared by the desktop row and the mobile panel, so the two cannot drift.
 * Full width on the row, full width of the panel on mobile.
 */
const NAV_PILL =
  "inline-flex items-center gap-2 min-h-[44px] rounded-full shadow-hairline " +
  "px-4 py-[9px] text-[15px] font-semibold text-ink no-underline " +
  "transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold";

const NAV_PRIMARY =
  "inline-flex items-center gap-2 min-h-[44px] rounded-full bg-ink " +
  "px-[18px] py-[10px] text-[15px] font-bold text-white no-underline " +
  "transition-[color,background-color,box-shadow] duration-150 ease-out hover:opacity-90";

/**
 * Sign out.
 *
 * Icon only on the desktop row, where four labelled pills would crowd out
 * "Post a solution", and labelled in the mobile panel, where there is room
 * for words and an icon on its own would be a guess. This mirrors the
 * settings control on the woman-facing header.
 *
 * A form posting to a server action rather than a link, since signing out is
 * a state change and must not be something a prefetch or a crawler can do.
 */
function SignOutControl({
  label = false,
  full = false,
}: {
  /** Words as well as the icon. Dropped only where the row is already full. */
  label?: boolean;
  /** Fills the mobile panel, matching the links stacked above it. */
  full?: boolean;
}) {
  return (
    <form action={signOut} className={full ? "contents" : "flex"}>
      <button
        type="submit"
        aria-label={label ? undefined : "Sign out"}
        className={[
          "inline-flex min-h-[44px] cursor-pointer items-center justify-center",
          "rounded-full border-0 bg-surface text-ink shadow-hairline",
          "transition-[color,background-color,box-shadow] duration-150 ease-out",
          "hover:shadow-hairline-gold",
          label
            ? "gap-2 px-4 py-[9px] text-[15px] font-semibold"
            : "min-w-[44px]",
          full ? "w-full" : "",
        ].join(" ")}
      >
        <LogOut size={17} strokeWidth={2} aria-hidden="true" />
        {label ? <span>Sign out</span> : null}
      </button>
    </form>
  );
}

function NavLinks({ liveCount }: { liveCount: number }) {
  return (
    <>
      <Link href="/dashboard" className={NAV_PILL}>
        <LayoutDashboard size={17} strokeWidth={2} aria-hidden="true" />
        <span>My solutions</span>
        <span className="rounded-full bg-gold-200 px-2 py-[2px] text-[13px] font-bold text-gold-700">
          {liveCount}
        </span>
      </Link>
      <Link href="/organisation" className={NAV_PILL}>
        <Building2 size={17} strokeWidth={2} aria-hidden="true" />
        <span>Organisation</span>
      </Link>
      <Link href="/solutions/new" className={NAV_PRIMARY}>
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        <span>Post a solution</span>
      </Link>
    </>
  );
}

export function OrgHeader({
  signedIn = false,
  hasOrganisation = false,
  liveCount = 0,
}: OrgHeaderProps) {
  return (
    /* relative so the mobile panel can hang off the bottom edge. */
    <header className="sticky top-0 z-20 border-b border-hairline bg-ground">
      <div className="relative">
        {/*
          Full width rather than a centred 1100px column. The header is
          furniture: capping it leaves the logo floating in the middle of a
          wide screen while the page beneath still runs to the edges.
        */}
        <div className="flex w-full items-center justify-between gap-6 px-5 py-[18px] sm:px-8 lg:px-10">
          {/* The name is on the link and alt is empty, so it is announced
              once, as the thing it does, rather than twice. */}
          <Link
            href="/"
            aria-label="HWS Pathgrid, home"
            className="flex shrink-0 items-center no-underline"
          >
            <Image
              src="/logo.svg"
              alt=""
              width={100}
              height={36}
              priority
              // Served as authored. The image optimiser does not process
              // SVG, and there is nothing to gain from it on a 5KB vector.
              unoptimized
            />
          </Link>

          {!signedIn ? null : hasOrganisation ? (
            <>
              <nav
                aria-label="Organisation"
                className="hidden items-center gap-2 lg:flex"
              >
                <NavLinks liveCount={liveCount} />
                {/* Unlabelled here only because three pills and a primary
                    button already fill the row. */}
                <SignOutControl />
              </nav>

              <MobileNav label="organisation menu">
                <NavLinks liveCount={liveCount} />
                <SignOutControl label full />
              </MobileNav>
            </>
          ) : (
            /* Part way through onboarding. One control, so it is shown
               directly and in words at every width, rather than hidden
               behind a menu button with a single item inside it. */
            <SignOutControl label />
          )}
        </div>
      </div>
    </header>
  );
}
