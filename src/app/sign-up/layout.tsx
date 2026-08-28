import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The sign-up form is a client component, so the page cannot export metadata
 * or check for a session itself. This layout does both and adds no markup.
 */
export const metadata: Metadata = { title: "Get Started" };

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in. Offering to create a second account to someone who is
  // part way through setting up their first is how one organisation ends up
  // with two, which `create_organisation` refuses anyway.
  if (user) redirect("/");

  return children;
}
