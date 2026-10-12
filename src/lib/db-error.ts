import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Turning a database failure into something that says what happened.
 *
 * The companion to auth-error.ts, written for the same reason and after the
 * same kind of incident. Onboarding returned `error.message` straight to the
 * screen, so a loans officer at NatWest spent a fortnight looking at
 *
 *     This account cannot create an organisation
 *
 * which is a Postgres `raise exception` written for whoever reads the
 * migration. It is accurate and it is useless: it does not say why the
 * account cannot, whether she did something wrong, or who could fix it. She
 * emailed a colleague instead, which is the only move the sentence left her.
 *
 * Two audiences, two levels of detail, as next door:
 *
 *   * The server log gets the code, the constraint and the raw message.
 *   * The screen gets a sentence naming the cause and the next move, and
 *     nothing else — no SQLSTATE, no table names, no "contact support" with
 *     no way to do it.
 *
 * Matching on message text as well as code is deliberate. These are
 * `raise exception` strings with no code of their own, so the text is the
 * only signal there is; the patterns are loose enough to survive rewording.
 */

type Described = {
  /** Shown on the screen. */
  message: string;
  /** True when trying the same thing again could plausibly work. */
  retryable: boolean;
};

/** `where` is the flow, for the log: "create-organisation", "profile". */
export function describeDbError(
  where: string,
  error: PostgrestError,
): Described {
  console.error(
    `[db:${where}] code=${error.code ?? "none"} details=${JSON.stringify(
      error.details ?? null,
    )} hint=${JSON.stringify(error.hint ?? null)} message=${JSON.stringify(
      error.message,
    )}`,
  );

  const text = error.message ?? "";

  // Already in one. The commonest of these by far, and the only one where the
  // person has genuinely done nothing wrong and nothing is broken: a
  // colleague got there first, or they are mid-flow on a second tab.
  if (/already belongs to an organisation/i.test(text)) {
    return {
      message:
        "This account is already part of an organisation, so it cannot start a second one. " +
        "If you need to add a colleague, invite them from your dashboard. If you think you " +
        "are in the wrong organisation, let us know and we will move you.",
      retryable: false,
    };
  }

  // Should no longer be reachable: migration 0026 lets any signed-in account
  // register an organisation. Kept because an environment running the old
  // function would otherwise show the raw sentence again, which is the exact
  // thing this file exists to stop.
  if (/cannot create an organisation/i.test(text)) {
    return {
      message:
        "This email is registered as a personal account, which cannot register an organisation yet. " +
        "Tell us and we will switch it over, or sign up again with a work address.",
      retryable: false,
    };
  }

  // The session went while the form was open. Common on a form this long.
  if (/not signed in/i.test(text) || error.code === "PGRST301") {
    return {
      message:
        "You have been signed out, probably because this page was open a while. " +
        "Sign in again and what you typed will still be here.",
      retryable: true,
    };
  }

  // 23505: something unique already exists. On this form that is the name.
  if (error.code === "23505") {
    return {
      message:
        "Something with that name is already registered. Check whether a colleague has " +
        "already added your organisation, and ask them to invite you rather than adding it twice.",
      retryable: false,
    };
  }

  // 42501 and PGRST204 are the shapes a row-level security refusal takes.
  // Nothing the person can do, and saying "permission denied" invites them to
  // try again harder.
  if (error.code === "42501" || error.code === "PGRST204") {
    return {
      message:
        "This account does not have permission to change that. If it is yours and that seems " +
        "wrong, tell us and we will sort it out.",
      retryable: false,
    };
  }

  // Everything else. Honest about not knowing, specific about the next step,
  // and it does not pretend the raw message would have helped.
  return {
    message:
      "Something went wrong saving that, and it was not anything you did. Try once more, " +
      "and if it happens again tell us what you were filling in and we will fix it.",
    retryable: true,
  };
}
