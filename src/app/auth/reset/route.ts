import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Destination of the password-reset email.
 *
 * Handles both shapes Supabase can send, for the same reason /auth/confirm
 * does. `code` is the PKCE exchange and only works in the browser that asked
 * for the reset, because the verifier is a cookie there. Someone locked out
 * of their account will often ask on a laptop and open the mail on a phone,
 * so `token_hash` is handled too: it verifies server side and needs nothing
 * stored locally.
 *
 * There is a third shape this route cannot see. On the implicit flow Supabase
 * returns the tokens in a URL fragment, which browsers never send to a
 * server. That case is picked up on /reset-password by the client instead,
 * which is why a failure here still forwards rather than giving up.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin;

  const error = params.get("error_description") ?? params.get("error");
  if (error) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(error)}`,
    );
  }

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");

  const supabase = await createClient();
  let recovered = false;

  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    recovered = !verifyError;
  } else if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    recovered = !exchangeError;
  }

  // Forward either way. If nothing arrived in the query string the tokens may
  // still be in the fragment, and only the browser can tell us that.
  return NextResponse.redirect(
    `${origin}/reset-password${recovered ? "" : "?checking=1"}`,
  );
}
