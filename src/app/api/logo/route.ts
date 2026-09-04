import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganisation } from "@/lib/data/organisations";
import { normaliseWebsite } from "@/lib/website";
import { findLogoCandidates } from "@/lib/logo";

/**
 * Icons found on an organisation's own website.
 *
 * Behind sign-in and behind organisation membership, deliberately. This
 * endpoint makes our server fetch a URL somebody typed, and an open one would
 * be a proxy anyone could point anywhere. `lib/logo.ts` blocks the private
 * ranges; this blocks the strangers.
 *
 * Nothing is stored here. The candidates come back as data URLs for the
 * organisation to look at, and only the one they pick is saved, by the form
 * action, into their own folder in the bucket.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const organisation = await getMyOrganisation();
  if (!organisation) {
    return NextResponse.json(
      { error: "No organisation on this account." },
      { status: 403 },
    );
  }

  let website: unknown;
  try {
    ({ website } = await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const normalised = normaliseWebsite(typeof website === "string" ? website : "");
  if (!normalised.ok) {
    return NextResponse.json({ error: normalised.error }, { status: 400 });
  }
  if (!normalised.value) {
    return NextResponse.json(
      { error: "Add your website address first." },
      { status: 400 },
    );
  }

  const candidates = await findLogoCandidates(normalised.value);

  return NextResponse.json({ website: normalised.value, candidates });
}
