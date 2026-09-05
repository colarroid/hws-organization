import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, LayoutDashboard, LogIn, Rows3 } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { getMyOrganisation } from "@/lib/data/organisations";

export const metadata: Metadata = {
  title: "We cannot find that page",
  robots: { index: false, follow: false },
};

/**
 * The 404.
 *
 * Until now this was the stock Next.js screen: black on white, "404 | This
 * page could not be found", nothing else. That is the wrong thing to show
 * here, because most of what lands on it arrives from one of our own emails.
 * A verification result, a deadline reminder, an invite: all of them carry
 * links into this portal, some of them are months old by the time anybody
 * clicks, and a screen that looks like the site is broken is how an
 * organisation decides posting here is not worth the trouble.
 *
 * So it says which of the two things happened, in plain words, and offers the
 * three places somebody wanted to be. It does not apologise: a stale link is
 * a small thing and treating it as a crisis is its own kind of noise.
 *
 * The routes out depend on whether there is an organisation behind the
 * session. Offering "your solutions" to somebody who is signed out sends them
 * through a redirect to a sign-in screen that could have been the link in the
 * first place.
 */
export default async function NotFound() {
  // A 404 must render even when the session read fails. This is the screen
  // somebody is on because something already went wrong; it is not the place
  // to throw a second time.
  const organisation = await getMyOrganisation().catch(() => null);

  const ways = organisation
    ? [
        {
          href: "/dashboard",
          icon: LayoutDashboard,
          title: "Your overview",
          body: "How many women reached what you posted, and anything waiting on you.",
        },
        {
          href: "/solutions",
          icon: Rows3,
          title: "Your solutions",
          body: "Everything you have posted, live or otherwise, and the button to post another.",
        },
        {
          href: "/organisation",
          icon: Building2,
          title: "Your organisation",
          body: "Your profile, and what we show women about who you are.",
        },
      ]
    : [
        {
          href: "/sign-in",
          icon: LogIn,
          title: "Sign in",
          body: "If you were following a link from us, signing in should take you the rest of the way.",
        },
        {
          href: "/sign-up",
          icon: Building2,
          title: "List your support",
          body: "If you have not registered yet, this is where an organisation starts.",
        },
      ];

  return (
    <Page width={760} top={72} gap={30}>
      <div className="flex flex-col gap-[10px]">
        <span className="eyebrow text-ink-60">404</span>
        <h1 className="m-0 font-display text-[30px] font-normal leading-[1.15] tracking-[-0.01em] sm:text-[44px] sm:leading-[1.1]">
          We cannot find that page
        </h1>
        <p className="m-0 max-w-[58ch] text-[18px] leading-[1.6] text-ink-70">
          Either the address is not quite right, or you have followed a link
          from an older email and what it pointed at has moved. Both happen,
          and neither is your fault.
        </p>
      </div>

      <div className="flex flex-col gap-[14px]">
        {ways.map((way) => (
          <Link
            key={way.href}
            href={way.href}
            className="group flex items-start gap-4 rounded-card bg-surface p-6 no-underline shadow-hairline transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-panel"
          >
            <way.icon
              size={22}
              strokeWidth={1.75}
              className="mt-[2px] shrink-0 text-gold-700"
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="font-display text-[20px] font-normal leading-[1.25] text-ink">
                {way.title}
              </span>
              <span className="text-[16px] leading-[1.55] text-ink-70">
                {way.body}
              </span>
            </span>
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="mt-2 shrink-0 text-gold-700 transition-transform duration-150 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      {/* Reply to the email rather than a support address nobody watches.
          Every message this portal sends comes from an address that reaches
          us, and it is the one an organisation already has. */}
      <p className="m-0 max-w-[58ch] border-t border-hairline pt-7 text-[16px] leading-[1.6] text-ink-70">
        If a link we sent you has stopped working, reply to that email and we
        will find out what happened to it.
      </p>
    </Page>
  );
}
