import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { OrgHeader } from "@/components/organisations/OrgHeader";
import { OrgSidebar } from "@/components/organisations/OrgSidebar";
import { getMyOrganisation } from "@/lib/data/organisations";
import { getListings } from "@/lib/data/listings";
import { onboardingNextStep } from "@/lib/onboarding";
import { isProfileComplete } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

// next/font self-hosts both families at build time, which satisfies the
// handoff note that Google Fonts must be self-hosted in production.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Every screen sets its own title, matching the heading it shows. The
 * template appends the suffix so no page repeats it.
 *
 * `default` covers only the root redirect, which never paints, so it names
 * the portal rather than any one screen. It used to read "List your support",
 * which is a screen name, and every tab in the portal inherited it.
 */
export const metadata: Metadata = {
  title: {
    default: "HWS Portal for organisations",
    template: "%s | HWS Portal",
  },
  description:
    "Reach women across Scotland who are looking for exactly what you offer.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Two separate questions, deliberately. The nav links need an organisation
  // to point at, but signing out only needs a session: someone part way
  // through onboarding has no organisation yet, and they are among the most
  // likely to want out, having just realised they are on the wrong account.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const organisation = user ? await getMyOrganisation() : null;

  // The rail waits until onboarding proper is done. Before that there is
  // genuinely nowhere to move between, and while the profile is still owed
  // there is exactly one place, so the rail holds only that.
  const onboarding = organisation ? onboardingNextStep(organisation) : null;
  const navigable = Boolean(organisation) && !onboarding;
  const restricted = navigable && !isProfileComplete(organisation!);

  // The count beside "My solutions" is live listings rather than all of them.
  const listings = organisation ? await getListings(organisation.id) : [];
  const liveCount = listings.filter((l) => l.status === "live").length;

  return (
    <html lang="en-GB" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        {/*
          The rail appears only once there is an organisation to navigate.
          Before that, onboarding is a single column with nothing to move
          between, and a rail full of places you cannot go yet is furniture
          that only makes the flow look longer.
        */}
        <div className="flex min-h-screen bg-ground text-ink">
          {navigable ? (
            <OrgSidebar liveCount={liveCount} restricted={restricted} />
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <OrgHeader
              signedIn={Boolean(user)}
              hasOrganisation={navigable}
              liveCount={liveCount}
              restricted={restricted}
            />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
