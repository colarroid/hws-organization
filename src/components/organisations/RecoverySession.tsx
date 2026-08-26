"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type State = "checking" | "ready" | "expired";

/**
 * Establishes the recovery session from a URL fragment.
 *
 * Supabase's implicit flow returns the tokens after `#`, and browsers never
 * send a fragment to the server, so the route that handled the redirect had
 * no way of knowing they were there. Without this the link looked broken:
 * it bounced back to "Reset your password" with the form empty and no
 * explanation, which is exactly what someone locked out does not need.
 *
 * The fragment is cleared as soon as it has been used, so the tokens do not
 * sit in the address bar or in browser history.
 */
export function RecoverySession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    const supabase = createClient();

    async function resolve() {
      // Already signed in by the server route, which is the common case.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setState("ready");
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      if (hash.get("error_description") || hash.get("error")) {
        setState("expired");
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          // Take the tokens out of the address bar before anything else.
          window.history.replaceState(null, "", window.location.pathname);
          setState("ready");
          // The server needs to see the new cookies to accept the change.
          router.refresh();
          return;
        }
      }

      setState("expired");
    }

    resolve();
  }, [router]);

  if (state === "checking") {
    return (
      <p aria-live="polite" className="m-0 text-[17px] leading-[1.6] text-ink-70">
        Checking your link…
      </p>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p
          role="alert"
          className="m-0 rounded-control border border-gold-300 bg-gold-200 px-4 py-3 text-[16px] leading-[1.5] text-gold-700"
        >
          That link has expired or has already been used. Reset links work for
          one hour and only once.
        </p>
        <a
          href="/forgot-password"
          className="inline-flex min-h-[44px] items-center rounded-control bg-ink px-6 py-4 text-[16px] font-bold text-white no-underline"
        >
          Send me a new link
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
