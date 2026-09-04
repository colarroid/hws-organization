import Image from "next/image";
import Link from "next/link";
import { OrgNav } from "@/components/organisations/OrgNav";

/**
 * The portal's navigation, once there is an organisation to navigate.
 *
 * A rail rather than a row because the portal is a desk tool: it is used on a
 * laptop, in work time, and the same few places are returned to all day. A top
 * row makes those compete with the page heading for one band of screen; down
 * the side they stay put and the page gets its full width back.
 *
 * Below the desktop breakpoint this is not rendered at all. The header keeps
 * the panel there, holding the same places, because a rail on a phone is a
 * drawer and a drawer is a worse version of the menu that already exists.
 */
export function OrgSidebar({
  liveCount = 0,
  restricted = false,
}: {
  liveCount?: number;
  restricted?: boolean;
}) {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-hairline bg-surface lg:block">
      {/* Sticky rather than fixed, so it scrolls with a short page and holds
          on a long one without taking the content out of normal flow. */}
      <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
        <Link
          href={restricted ? "/organisation/profile" : "/dashboard"}
          aria-label="HWS Pathgrid"
          className="mb-7 flex shrink-0 items-center no-underline"
        >
          <Image src="/logo.svg" alt="" width={100} height={36} priority unoptimized />
        </Link>

        <OrgNav variant="rail" liveCount={liveCount} restricted={restricted} />
      </div>
    </aside>
  );
}
