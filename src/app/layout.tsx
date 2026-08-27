import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { OrgHeader } from "@/components/organisations/OrgHeader";
import { getMyOrganisation } from "@/lib/data/organisations";
import { getListings } from "@/lib/data/listings";
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

  // The count beside "My solutions" is live listings rather than all of them.
  const listings = organisation ? await getListings(organisation.id) : [];
  const liveCount = listings.filter((l) => l.status === "live").length;

  return (
    <html lang="en-GB" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col bg-ground text-ink">
          <OrgHeader
            signedIn={Boolean(user)}
            hasOrganisation={Boolean(organisation)}
            liveCount={liveCount}
          />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
