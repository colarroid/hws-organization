import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The real destination of the confirmation email.
 *
 * Exchanges the emailed code for a session, then drops the organisation
 * straight into onboarding step 1. Verification gates publishing, not access,
 * so nobody waits here.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=link-expired`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=link-expired`);
  }

  return NextResponse.redirect(`${origin}/onboarding/about`);
}
