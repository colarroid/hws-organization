import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { MobileNav } from "@/components/ui/MobileNav";
import { OrgNav } from "@/components/organisations/OrgNav";
import { LanguageMenu } from "@/components/LanguageMenu";
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
  /** The profile is still owed, so the menu holds only that. */
  restricted?: boolean;
  /** For the language control, which is in the header at this width. */
  locale?: string;
};

/**
 * Sign out, for the header rather than the rail.
 *
 * A form posting to a server action rather than a link, since signing out is
 * a state change and must not be something a prefetch or a crawler can do.
 */
function SignOutControl() {
  return (
    <form action={signOut} className="flex">
      <button
        type="submit"
        className={
          "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-0 bg-surface px-4 py-[9px] text-[15px] font-semibold text-ink shadow-hairline transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold"
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
  restricted = false,
  locale = "en",
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

          {/* The language control sits outside the menu, because somebody who
              cannot read the interface should not have to open something
              labelled in it to find the way out. */}
          <div className="flex items-center gap-1">
            <LanguageMenu current={locale} />

            {!signedIn ? null : hasOrganisation ? (
              <MobileNav label="organisation menu">
                <OrgNav variant="panel" liveCount={liveCount} restricted={restricted} />
              </MobileNav>
            ) : (
              /* Part way through onboarding. One control, so it is shown
                 directly and in words at every width, rather than hidden
                 behind a menu button with a single item inside it. */
              <SignOutControl />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
