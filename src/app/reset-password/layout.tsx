import type { Metadata } from "next";

/**
 * The password reset form is a client component, so the page cannot export metadata
 * itself. This layout exists only to give the screen its title, and adds no
 * markup of its own.
 */
export const metadata: Metadata = { title: "Set a new password" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
