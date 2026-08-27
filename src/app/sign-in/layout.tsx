import type { Metadata } from "next";

/**
 * The sign-in form is a client component, so the page cannot export metadata
 * itself. This layout exists only to give the screen its title, and adds no
 * markup of its own.
 */
export const metadata: Metadata = { title: "Sign in" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
