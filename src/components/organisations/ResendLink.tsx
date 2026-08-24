"use client";

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
      {sent ? (
        <span>Sent again. It can take a minute to arrive.</span>
      ) : ready ? (
        <>
          Nothing arrived?{" "}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await resendConfirmation(email);
                setSent(true);
                setRemaining(COOLDOWN_SECONDS);
              })
            }
            className="cursor-pointer border-0 bg-transparent p-1 text-[15px] font-bold text-gold-700 disabled:opacity-40"
          >
            Send it again
          </button>
        </>
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
