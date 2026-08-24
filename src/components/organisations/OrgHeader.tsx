import Link from "next/link";
import { Building2, LayoutDashboard, Plus } from "lucide-react";

type OrgHeaderProps = {
  /** Header navigation appears only once signed in. */
  signedIn?: boolean;
  /** Live listing count, shown as a pill beside "My solutions". */
  liveCount?: number;
};

const NAV_PILL =
  "inline-flex items-center gap-2 min-h-[44px] rounded-full border border-ring " +
  "px-4 py-[9px] text-[15px] font-semibold text-ink no-underline hover:border-gold-500";

export function OrgHeader({ signedIn = false, liveCount = 0 }: OrgHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-ground">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-8 px-10 py-[18px]">
        <div className="flex items-center gap-[14px]">
          {/* No logo asset yet. The designs show the word "Logo" as a placeholder. */}
          <Link
            href="/"
            className="text-[15px] font-bold uppercase tracking-[0.14em] text-ink no-underline"
          >
            Logo
          </Link>
          <span className="rounded-full border border-gold-300 bg-gold-200 px-3 py-1 text-[13px] font-semibold text-gold-700">
            For organisations
          </span>
        </div>

        {signedIn ? (
          <nav aria-label="Organisation" className="flex items-center gap-2">
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
            <Link
              href="/solutions/new"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-[18px] py-[10px] text-[15px] font-bold text-white no-underline"
            >
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              <span>Post a solution</span>
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
