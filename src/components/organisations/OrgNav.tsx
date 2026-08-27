"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Plus, Rows3 } from "lucide-react";
import { signOut } from "@/app/actions";

/**
 * The portal's four places, written once.
 *
 * The rail and the phone panel show the same destinations and were drifting
 * apart as two copies. One component renders both: `rail` sits in a column
 * down the side of a desktop, `panel` in the sheet under the header. What
 * changes between them is chrome, never which places exist or what they are
 * called.
 *
 * A client component because the current page has to be marked in both, and
 * that is worth more on the phone than on the rail: the panel covers the page
 * it was opened from, so without it there is nothing on screen saying where
 * you already are.
 */

const ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, counted: false },
  { href: "/solutions", label: "My solutions", icon: Rows3, counted: true },
  { href: "/organisation", label: "Organisation", icon: Building2, counted: false },
] as const;

/**
 * Exact for Overview, prefix for the rest, so editing a listing still shows
 * as My solutions rather than as nowhere.
 */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function OrgNav({
  variant,
  liveCount = 0,
}: {
  variant: "rail" | "panel";
  liveCount?: number;
}) {
  const isActive = useIsActive();
  const panel = variant === "panel";

  // No rail on the active item. The fill carries it: gold 200 on the white
  // panel is a clear enough step, and it has the weight change and the gold
  // icon with it.
  const base =
    "inline-flex min-h-[44px] w-full items-center gap-3 rounded-control " +
    "px-3 py-[10px] text-[15px] no-underline " +
    "transition-[color,background-color] duration-150 ease-out";

  return (
    // flex-1 on the rail so "Log out" can be pushed to the foot of the screen
    // rather than the foot of the list.
    <div className={panel ? "flex flex-col" : "flex flex-1 flex-col"}>
      {/*
        Panel only. On a desktop the rail stays four places and nothing else,
        and posting is offered where it is actually being thought about:
        Overview and My solutions both carry the control. On a phone the panel
        is the only navigation there is, so leaving it out would bury the one
        thing the portal is for behind two taps.
      */}
      {panel ? (
        <Link
          href="/solutions/new"
          className="mb-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink px-[18px] py-[11px] text-[15px] font-bold text-white no-underline transition-opacity duration-150 ease-out hover:opacity-90"
        >
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>Post a solution</span>
        </Link>
      ) : null}

      <nav aria-label="Organisation" className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon, counted }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                base,
                active
                  ? "bg-gold-200 font-semibold text-ink"
                  : "font-medium text-ink-70 hover:bg-gold-200/60 hover:text-ink",
              ].join(" ")}
            >
              <Icon
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className={active ? "text-gold-700" : "text-ink-60"}
              />
              <span className="flex-1">{label}</span>
              {counted && liveCount > 0 ? (
                <span
                  className={[
                    "rounded-full px-2 py-[2px] text-[13px] font-bold tabular-nums",
                    active
                      ? "bg-surface text-gold-700"
                      : "bg-gold-200 text-gold-700",
                  ].join(" ")}
                >
                  {liveCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Separated, and last. It is not one of the places you go. */}
      <form
        action={signOut}
        className={
          panel
            ? "mt-2 border-t border-hairline-soft pt-2"
            : "mt-auto border-t border-hairline-soft pt-3"
        }
      >
        <button
          type="submit"
          className={`${base} cursor-pointer border-0 bg-transparent text-left font-medium text-ink-70 hover:bg-gold-200/60 hover:text-ink`}
        >
          <LogOut size={18} strokeWidth={2} aria-hidden="true" className="text-ink-60" />
          <span>Log out</span>
        </button>
      </form>
    </div>
  );
}
