import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { ContinueToSignIn } from "@/components/organisations/ContinueToSignIn";

export const metadata: Metadata = { title: "Email confirmed" };

/**
 * The landing point of the confirmation link.
 *
 * The link used to drop her straight into onboarding on whichever device
 * opened it. People routinely open email on a phone having signed up on a
 * laptop, so that device was often the wrong one to be signed in on, and it
 * stayed signed in.
 *
 * So /auth/confirm ends the session it just created and sends her here
 * instead: one screen that says the confirming worked, then sign-in on
 * whichever device she actually means to work on. It also means the password
 * she chose minutes ago gets used once while she still remembers it.
 */
export default function ConfirmedPage() {
  return (
    <Page width={560} top={88}>
      <span className="flex text-green-700">
        <BadgeCheck size={40} strokeWidth={2} aria-hidden="true" />
      </span>

      <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
        Email confirmed
      </h1>

      <p className="m-0 max-w-[52ch] text-[18px] leading-[1.6] text-ink-70">
        Your address is confirmed and your account is ready. Sign in and we
        will pick up where you left off.
      </p>

      <div className="flex flex-col gap-4">
        <ButtonLink
          href="/sign-in"
          size="inline"
          className="self-start px-7 py-4 text-[17px]"
        >
          Sign in
        </ButtonLink>
        <ContinueToSignIn />
      </div>
    </Page>
  );
}
