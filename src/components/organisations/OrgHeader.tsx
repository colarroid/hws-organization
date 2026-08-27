import Image from "next/image";
import Link from "next/link";
import { Building2, LayoutDashboard, LogOut, Plus, Rows3 } from "lucide-react";
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

const PANEL_LINK =
  "inline-flex w-full items-center gap-3 min-h-[44px] rounded-control " +
  "px-3 py-[10px] text-[15px] font-semibold text-ink no-underline " +
  "transition-[color,background-color] duration-150 ease-out hover:bg-gold-200";

/**
 * Sign out, for the header rather than the rail.
 *
 * A form posting to a server action rather than a link, since signing out is
 * a state change and must not be something a prefetch or a crawler can do.
 */
function SignOutControl({ inPanel = false }: { inPanel?: boolean }) {
  return (
    <form action={signOut} className={inPanel ? "contents" : "flex"}>
      <button
        type="submit"
        className={
          inPanel
            ? `${PANEL_LINK} cursor-pointer border-0 bg-transparent text-left`
            : "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-0 bg-surface px-4 py-[9px] text-[15px] font-semibold text-ink shadow-hairline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
        }
      >
        <LogOut size={17} strokeWidth={2} aria-hidden="true" />
        <span>Log out</span>
      </button>
    </form>
  );
}

/**
 * The header.
 *
 * Two jobs, and which one it is doing depends on where onboarding has got to.
 *
 * With an organisation, the rail carries navigation on a desktop, so this
 * stands down there entirely and exists only below that breakpoint, where it
 * holds the same four places in the menu panel.
 *
 * Without one, there is no rail, so the header stays at every width. It has
 * only a logo and a way out, which is all onboarding needs.
 */
export function OrgHeader({
  signedIn = false,
  hasOrganisation = false,
  liveCount = 0,
}: OrgHeaderProps) {
  return (
    <header
      className={[
        "sticky top-0 z-20 border-b border-hairline bg-ground",
        // The rail replaces this on a desktop, but only once it is rendered.
        hasOrganisation ? "lg:hidden" : "",
      ].join(" ")}
    >
      {/* relative so the mobile panel can hang off the bottom edge. */}
      <div className="relative">
        <div className="flex w-full items-center justify-between gap-6 px-5 py-[18px] sm:px-8">
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
            <MobileNav label="organisation menu">
              <Link href="/solutions/new" className={`${PANEL_LINK} bg-ink text-white hover:bg-ink hover:opacity-90`}>
                <Plus size={17} strokeWidth={2} aria-hidden="true" />
                <span>Post a solution</span>
              </Link>
              <Link href="/dashboard" className={PANEL_LINK}>
                <LayoutDashboard size={17} strokeWidth={2} aria-hidden="true" />
                <span>Overview</span>
              </Link>
              <Link href="/solutions" className={PANEL_LINK}>
                <Rows3 size={17} strokeWidth={2} aria-hidden="true" />
                <span className="flex-1">My solutions</span>
                {liveCount > 0 ? (
                  <span className="rounded-full bg-gold-200 px-2 py-[2px] text-[13px] font-bold text-gold-700">
                    {liveCount}
                  </span>
                ) : null}
              </Link>
              <Link href="/organisation" className={PANEL_LINK}>
                <Building2 size={17} strokeWidth={2} aria-hidden="true" />
                <span>Organisation</span>
              </Link>
              <SignOutControl inPanel />
            </MobileNav>
          ) : (
            /* Part way through onboarding. One control, so it is shown
               directly and in words at every width, rather than hidden
               behind a menu button with a single item inside it. */
            <SignOutControl />
          )}
        </div>
      </div>
    </header>
  );
}
