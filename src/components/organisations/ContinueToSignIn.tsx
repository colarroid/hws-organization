"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SECONDS = 5;

/**
 * Moves on to sign-in on its own, and says so while it waits.
 *
 * The button beside it is the real control: it is a plain link in the markup,
 * so it works before this hydrates and if scripting never runs at all. This
 * only saves a tap for people who would have taken it anyway.
 *
 * Counting down out loud matters more than the five seconds saved. A screen
 * that moves without warning is disorienting, and `aria-live` means the
 * warning is heard as well as seen.
 */
export function ContinueToSignIn() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(SECONDS);

  useEffect(() => {
    if (remaining <= 0) {
      router.replace("/sign-in");
      return;
    }
    const timer = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, router]);

  return (
    <span aria-live="polite" className="text-[15px] text-ink-60">
      Taking you to sign in
      {remaining > 0 ? ` in ${remaining} ${remaining === 1 ? "second" : "seconds"}` : ""}.
    </span>
  );
}
