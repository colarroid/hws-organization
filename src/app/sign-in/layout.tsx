import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The sign-in form is a client component, so the page cannot export metadata
 * or check for a session itself. This layout does both and adds no markup.
 */
export const metadata: Metadata = { title: "Sign in" };

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in, so there is nothing to sign in to. Without this the
  // screen rendered an empty sign-in form with the navigation rail beside it,
  // offering places the person could already reach and a way to log out of a
  // session the form was asking them to start.
  //
  // The root works out whether that is the dashboard or the rest of
  // onboarding, so it is not decided twice.
  if (user) redirect("/");

  return children;
}
