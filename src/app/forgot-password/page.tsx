import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { ResetRequestForm } from "@/components/organisations/ResetRequestForm";

/**
 * Screen 4. Reset your password.
 *
 * Two states in one screen. The sent state uses deliberately conditional
 * wording, and returns identically whether or not an account exists, so the
 * screen never discloses which addresses are registered.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; email?: string; error?: string }>;
}) {
  const { sent, email, error } = await searchParams;

  return (
    <Page width={480} top={72}>
      <Link
        href="/sign-in"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Sign in
      </Link>

      {/* A link that failed used to drop them back here with no explanation,
          which reads as the reset simply not working. */}
      {error ? (
        <p
          role="alert"
          className="m-0 rounded-control border border-gold-300 bg-gold-200 px-4 py-3 text-[16px] leading-[1.5] text-gold-700"
        >
          That link has expired or has already been used. Reset links work for
          one hour and only once. Ask for a new one below.
        </p>
      ) : null}

      {sent && !error ? (
        <div className="flex flex-col gap-[22px]">
          <span className="flex text-gold-500">
            <Mail size={36} strokeWidth={2} aria-hidden="true" />
          </span>
          <h1 className="m-0 font-display text-[38px] font-normal leading-[1.1] tracking-[-0.01em]">
            Check your email
          </h1>
          <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
            If there is an account for{" "}
            <strong className="text-ink">{email ?? "that address"}</strong>, we
            have sent a link to set a new password. It works for one hour.
          </p>
          <span className="text-[15px] leading-[1.5] text-ink-60">
            Check your spam folder. If nothing arrives, the address may not have
            an account with us.
          </span>
        </div>
      ) : (
        <ResetRequestForm />
      )}
    </Page>
  );
}
