import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert, UserPlus } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Form";
import { AcceptInvitationForms } from "@/components/organisations/InviteForms";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitation } from "@/app/invite/[token]/actions";

export const metadata: Metadata = { title: "Join your colleagues" };

type Details = {
  organisation_name: string;
  email: string;
  expired: boolean;
  accepted: boolean;
};

/**
 * The invitation screen.
 *
 * Reachable signed out, which is the point: most people opening this have no
 * account yet. It reads the invitation through a security-definer function
 * rather than a table policy, so an unknown token returns nothing at all and
 * guessing one tells you only that it was wrong.
 *
 * Three states. Already signed in as the invited address, one button. Signed
 * out, the two ways in. Signed in as somebody else, say so plainly rather
 * than failing at the last step.
 */
export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const { data } = await supabase.rpc("invitation_details", { p_token: token });
  const details = (data as Details[] | null)?.[0];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!details || details.expired || details.accepted) {
    return (
      <Page width={520} top={80} gap={22}>
        <span className="flex text-gold-500">
          <TriangleAlert size={36} strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
          This link has expired
        </h1>
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.6] text-ink-70">
          {details?.accepted
            ? "This invitation has already been used. If that was you, sign in and you are already a member."
            : "Invitations last fourteen days. Ask whoever invited you to send another one."}
        </p>
        <Link href="/sign-in" className="self-start p-1 text-[16px] font-bold text-gold-700">
          Go to sign in
        </Link>
      </Page>
    );
  }

  const signedInAsInvitee =
    user?.email?.toLowerCase() === details.email.toLowerCase();

  return (
    <Page width={520} top={80} gap={26}>
      <div className="flex flex-col gap-[10px]">
        <span className="flex text-gold-500">
          <UserPlus size={36} strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="m-0 font-display text-[40px] font-normal leading-[1.1] tracking-[-0.01em]">
          Join {details.organisation_name}
        </h1>
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.6] text-ink-70">
          You can post and edit the support {details.organisation_name} offers.
          Verification stays with the organisation, so there is nothing for you
          to prove again.
        </p>
      </div>

      <FormError message={error} />

      {user && !signedInAsInvitee ? (
        <div className="flex flex-col items-start gap-4 rounded-card border border-gold-300 bg-gold-200 px-[22px] py-5">
          <p className="m-0 max-w-[52ch] text-[16px] leading-[1.6] text-gold-700">
            This invitation was sent to <strong>{details.email}</strong>, and
            you are signed in as <strong>{user.email}</strong>. Sign out first,
            then open this link again.
          </p>
        </div>
      ) : signedInAsInvitee ? (
        <form action={acceptInvitation}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="inline" className="px-7 py-4 text-[17px]">
            Join {details.organisation_name}
          </Button>
        </form>
      ) : (
        <AcceptInvitationForms token={token} email={details.email} />
      )}
    </Page>
  );
}
