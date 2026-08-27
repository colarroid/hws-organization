import Link from "next/link";
import { Building2, LayoutDashboard, Plus } from "lucide-react";
import { MobileNav } from "@/components/ui/MobileNav";

type OrgHeaderProps = {
  /** Header navigation appears only once signed in. */
  signedIn?: boolean;
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

export function OrgHeader({ signedIn = false, liveCount = 0 }: OrgHeaderProps) {
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
          <div className="flex min-w-0 items-center gap-[14px]">
            {/* No logo asset yet. The designs show the word "Logo". */}
            <Link
              href="/"
              className="text-[15px] font-bold uppercase tracking-[0.14em] text-ink no-underline"
            >
              Logo
            </Link>
            {/* Drops on the narrowest screens so the logo and the control fit. */}
            <span className="hidden rounded-full border border-gold-300 bg-gold-200 px-3 py-1 text-[13px] font-semibold text-gold-700 sm:inline">
              For organisations
            </span>
          </div>

          {signedIn ? (
            <>
              <nav
                aria-label="Organisation"
                className="hidden items-center gap-2 lg:flex"
              >
                <NavLinks liveCount={liveCount} />
              </nav>

              <MobileNav label="organisation menu">
                <NavLinks liveCount={liveCount} />
              </MobileNav>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
