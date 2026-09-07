import "server-only";
import type { AuthError } from "@supabase/supabase-js";

/**
 * Turning a Supabase auth failure into something that says where to look.
 *
 * Sign-up returned `error.message` straight to the screen, which is how an
 * organisation came to be staring at "Error sending confirmation email" with
 * nothing to do about it and nothing for us to go on. That string is GoTrue's
 * and it is the same string whether the template will not render, the SMTP
 * credentials are wrong, or the hourly send limit has been reached. Three
 * completely different problems, one sentence.
 *
 * The error object carries more than the message. `status` and `code` are on
 * it and were being thrown away, and between them they separate the causes we
 * can act on from the ones only the Supabase logs can explain.
 *
 * Two audiences, two levels of detail:
 *
 *   * The server log gets everything, prefixed so it can be searched for.
 *   * The screen gets a sentence a person can act on, and the code in
 *     brackets, because the person reporting a problem is usually the only
 *     one who ever sees it and "it said an error" is not a bug report.
 */

type Described = {
  /** Shown on the screen. */
  message: string;
  /** True when trying again shortly is genuinely likely to work. */
  retryable: boolean;
};

/**
 * `where` is the flow, for the log: "sign-up", "resend", "reset". Nothing
 * about it reaches the screen.
 */
export function describeAuthError(where: string, error: AuthError): Described {
  const code = error.code ?? "no-code";
  const status = error.status ?? 0;

  // Everything, in one line, searchable. The screen cannot carry this and the
  // person reading it could not act on it anyway.
  console.error(
    `[auth:${where}] status=${status} code=${code} message=${JSON.stringify(error.message)}`,
  );

  const reference = `${status || "?"}/${code}`;

  // Too many in too short a time. Genuinely common while anybody is testing,
  // and the one mailer failure that fixes itself.
  if (status === 429 || code === "over_email_send_rate_limit") {
    return {
      message:
        `Too many emails have gone out in the last few minutes, so this one was refused. ` +
        `Wait a few minutes and try again. (${reference})`,
      retryable: true,
    };
  }

  /*
   * The mailer failed and GoTrue will not say why.
   *
   * "Error sending confirmation email" is raised when the send fails, and the
   * actual cause, a template that will not render, a rejected SMTP login, a
   * refused connection, stays in Supabase's own logs. So the screen says what
   * is true, and names where the answer is, rather than repeating a sentence
   * that has already told everybody nothing.
   */
  if (/sending.*email/i.test(error.message)) {
    return {
      message:
        `We could not send the confirmation email. That is our end, not yours. ` +
        `Try again in a moment, and if it keeps happening tell us and quote ` +
        `${reference}.`,
      retryable: true,
    };
  }

  // Everything else: GoTrue's own wording is usually specific and useful
  // ("Password should be at least..."), so it is kept, with the code added so
  // a screenshot is enough to identify it.
  return {
    message: `${error.message} (${reference})`,
    retryable: false,
  };
}
