import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ResendLink } from "@/components/organisations/ResendLink";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { readPending } from "@/app/actions";

export const metadata: Metadata = { title: "Confirm your email" };

/**
 * Screen 2. Confirm your email.
 *
 * The prototype had an "I have confirmed it" button standing in for arriving
 * back via the emailed link. Production waits for the real thing, handled by
 * the token-verified route at /auth/confirm, so that button is deliberately
 * absent here.
 *
 * With Google removed this screen is on the critical path for every single
 * organisation. There is no bypass, which is why the spam-folder note matters
 * more than it looks.
 */
export default async function ConfirmPage() {
  // She confirmed in another tab or on her phone, then came back to this one
  // and reloaded. Leaving her on "check your email" when the account is
  // already live is the moment people give up and sign up again.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const organisation = await getMyOrganisation();
    redirect(organisation ? "/dashboard" : "/onboarding/about");
  }

  // No pending sign-up in this browser, so there is nothing here to wait for.
  // That covers the reload after confirming elsewhere, a bookmark, a stale
  // tab, and anyone who simply typed the address in. The screen used to take
  // the address from `?email=` and would render for any of them.
  const email = await readPending();
  if (!email) redirect("/sign-in");

  return (
    <Page width={520}>
      <span className="flex text-gold-500">
        <Mail size={36} strokeWidth={2} aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
          Confirm your email
        </h1>
        <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
          We sent a link to <strong className="text-ink">{email}</strong>. Open
          it to finish setting up your account. The link works for 24 hours.
        </p>
      </div>

      <div className="flex flex-col gap-[10px] rounded-card shadow-hairline bg-surface px-[22px] py-5">
        <span className="text-[16px] font-bold">Why we confirm it</span>
        <span className="text-[15px] leading-[1.6] text-ink-70">
          Every listing you post carries your organisation&apos;s name.
          Confirming the address is the first check that the person posting
          works there.
        </span>
      </div>

      {/* Reloading this page is the check. Say so, rather than leaving her
          to guess whether anything happened. */}
      <p className="m-0 text-[15px] leading-[1.6] text-ink-60">
        Opened the link already? Reload this page and we will take you
        straight in.
      </p>

      <div className="flex flex-col gap-2">
        <ResendLink />
        <Link
          href="/sign-up"
          className="self-start p-1 text-[15px] font-bold text-gold-700 no-underline"
        >
          Use a different address
        </Link>
      </div>
    </Page>
  );
}
