import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { clearPending } from "@/app/actions";

/**
 * The real destination of the confirmation email.
 *
 * Handles both shapes Supabase can send.
 *
 * `code` is the PKCE exchange, which only works in the browser that started
 * the sign-up, because the verifier is a cookie there. People routinely open
 * the email on their phone having signed up on a laptop, and that path has to
 * work too, so `token_hash` is handled as well: it verifies server side and
 * needs nothing stored locally.
 *
 * A failed link goes to sign-in, never to sign-up. Someone who has just
 * created an account and is being shown "create an account" reasonably
 * concludes it did not work and makes a second one.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin;
  const supabase = await createClient();

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");

  let confirmed = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    confirmed = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  }

  if (!confirmed) {
    return NextResponse.redirect(`${origin}/sign-in?error=link-expired`);
  }

  // Confirmed, so the pending marker has done its job. Clearing it means a
  // stale /confirm tab reloads onto sign-in instead of offering a resend
  // that Supabase would now refuse.
  await clearPending();

  // Onboarding if they have not started, their dashboard if they have.
  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .limit(1)
    .maybeSingle();

  return NextResponse.redirect(
    `${origin}${membership ? "/dashboard" : "/onboarding/about"}`,
  );
}
