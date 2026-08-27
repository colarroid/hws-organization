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
 *
 * Takes no address. The action reads the pending-confirmation cookie, so the
 * only address this can ever resend to is the one that signed up in this
 * browser.
 */
export function ResendLink() {
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

  const ready = remaining <= 0;

  return (
    <div aria-live="polite" className="text-[15px] text-ink-60">
      {/* `signIn` is terminal: the account is confirmed, so no amount of
          resending will produce an email and the control does not come back.
          Every other outcome returns it once the cooldown ends, since none of
          them mean trying again is pointless. */}
      {ready && !signIn ? (
        <>
          Nothing arrived?{" "}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await resendConfirmation();
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
        <span className={signIn ? "text-ink-70" : "text-red-700"}>
          {error}
          {/* Never a dead end. The cookie has been cleared server side too,
              so reloading this screen now lands on sign-in rather than here. */}
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
