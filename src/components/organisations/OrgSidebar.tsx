"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Plus, Rows3 } from "lucide-react";
import { signOut } from "@/app/actions";

type Item = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Live listing count, shown only where a number means something. */
  count?: number;
};

/**
 * The portal's navigation, once there is an organisation to navigate.
 *
 * A rail rather than a row because the portal is a desk tool: it is used on a
 * laptop, in work time, and the same four places are returned to all day. A
 * top row makes those four compete with the page heading for the same band of
 * screen; down the side they stay put and the page gets its full width back.
 *
 * Below the desktop breakpoint this is not rendered at all. The header keeps
 * the menu panel there, because a rail on a phone is a drawer, and a drawer is
 * a worse version of the menu that already exists.
 */
export function OrgSidebar({ liveCount = 0 }: { liveCount?: number }) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/solutions", label: "My solutions", icon: Rows3, count: liveCount },
    { href: "/organisation", label: "Organisation", icon: Building2 },
  ];

  /**
   * Exact for Overview, prefix for the rest. Editing a listing sits under
   * /solutions, and the rail should still show where you are.
   */
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-hairline bg-ground lg:block">
      {/* Sticky rather than fixed, so it scrolls with a short page and holds
          on a long one without taking the content out of normal flow. */}
      <div className="sticky top-0 flex h-screen flex-col gap-7 px-5 py-6">
        <Link
          href="/dashboard"
          aria-label="HWS Pathgrid, overview"
          className="flex shrink-0 items-center no-underline"
        >
          <Image src="/logo.svg" alt="" width={100} height={36} priority unoptimized />
        </Link>

        {/* The one thing the portal exists for, so it leads and it is the only
            filled control on the rail. */}
        <Link
          href="/solutions/new"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink px-[18px] py-[11px] text-[15px] font-bold text-white no-underline transition-opacity duration-150 ease-out hover:opacity-90"
        >
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>Post a solution</span>
        </Link>

        <nav aria-label="Organisation" className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon, count }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative inline-flex min-h-[44px] items-center gap-3 rounded-control",
                  "px-3 py-[10px] text-[15px] no-underline",
                  "transition-[color,background-color] duration-150 ease-out",
                  active
                    ? "bg-gold-200 font-semibold text-ink"
                    : "font-medium text-ink-70 hover:bg-gold-200/50 hover:text-ink",
                ].join(" ")}
              >
                {/* A gold rail on the active item. The fill alone reads as a
                    hover on a cream ground; the rail is what makes it a state. */}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full",
                    active ? "bg-gold-500" : "bg-transparent",
                  ].join(" ")}
                />
                <Icon
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={active ? "text-gold-700" : "text-ink-60"}
                />
                <span className="flex-1">{label}</span>
                {typeof count === "number" && count > 0 ? (
                  <span className="rounded-full bg-surface px-2 py-[2px] text-[13px] font-bold text-ink-70 tabular-nums shadow-hairline">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Pushed to the foot, away from the places you actually go. */}
        <form action={signOut} className="mt-auto">
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-control border-0 bg-transparent px-3 py-[10px] text-left text-[15px] font-medium text-ink-70 transition-[color,background-color] duration-150 ease-out hover:bg-gold-200/50 hover:text-ink"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden="true" className="text-ink-60" />
            <span>Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
