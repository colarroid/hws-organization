"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { resendConfirmation } from "@/app/actions";

const COOLDOWN_SECONDS = 60;

/**
 * "Send it again", with the 60-second cooldown the handoff specifies.
 *
 * The prototype rendered a fixed "in 47 seconds" as a static string. This
 * counts for real, and the control is a disabled button rather than plain
 * text while it waits, so its state is exposed rather than implied.
 */
export function ResendLink({ email }: { email?: string }) {
  const [remaining, setRemaining] = useState(COOLDOWN_SECONDS);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signIn, setSignIn] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  if (!email) return null;

  const ready = remaining <= 0;

  return (
    <div aria-live="polite" className="text-[15px] text-ink-60">
      {/* Never a dead end, so `ready` is tested first: whatever happened
          last time, once the cooldown ends the control is back and she can
          try again without reloading. */}
      {ready ? (
        <>
          Nothing arrived?{" "}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await resendConfirmation(email);
                // The cooldown restarts either way. If Supabase turned this
                // down for rate limiting, hammering the button is the one
                // thing that cannot help.
                setRemaining(COOLDOWN_SECONDS);
                if (result.ok) {
                  setError(null);
                  setSignIn(false);
                  setSent(true);
                } else {
                  setSent(false);
                  setError(result.error);
                  setSignIn(Boolean(result.signIn));
                }
              })
            }
            className="cursor-pointer border-0 bg-transparent p-1 text-[15px] font-bold text-gold-700 disabled:opacity-40"
          >
            Send it again
          </button>
        </>
      ) : error ? (
        <span className="text-red-700">
          {error}
          {/* Never a dead end: the one failure with an obvious way onward
              says so, rather than leaving her on a screen waiting for an
              email that is never coming because she does not need it. */}
          {signIn ? (
            <>
              {" "}
              <Link href="/sign-in" className="font-bold text-gold-700">
                Sign in
              </Link>
              .
            </>
          ) : null}
        </span>
      ) : sent ? (
        <span>Sent again. It can take a minute to arrive.</span>
      ) : (
        <>
          Nothing arrived? You can{" "}
          <strong className="text-gold-700">send it again</strong> in {remaining}{" "}
          {remaining === 1 ? "second" : "seconds"}.
        </>
      )}
    </div>
  );
}
