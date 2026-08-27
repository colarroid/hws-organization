"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/design/taxonomy";

export type FormState = { error?: string } | null;

/** Absolute origin for email redirect links, taken from the request host. */
async function origin() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

const email = z.string().trim().min(1, "Add your email address.").email();

/**
 * Proof that this browser is the one that just signed up.
 *
 * The confirm screen used to take its address from `?email=`, which anyone
 * can type. That made the screen, and the resend behind it, a way to ask
 * whether a given address is registered and confirmed. Nothing else in the
 * portal answers that question: sign-in returns one message for both cases,
 * and the reset screen is silent on purpose.
 *
 * This cookie closes it. The address is read from here rather than the URL,
 * so the only person who can reach the screen, or trigger a resend, is the
 * person who signed up in this browser. It is cleared the moment
 * confirmation lands, which is also what lets a reload move on rather than
 * sitting on "check your email" forever.
 *
 * 24 hours, matching the lifetime of the link itself.
 */
const PENDING_COOKIE = "hws_pending_confirmation";
const PENDING_MAX_AGE = 60 * 60 * 24;

async function setPending(address: string) {
  (await cookies()).set(PENDING_COOKIE, address, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_MAX_AGE,
  });
}

export async function readPending() {
  return (await cookies()).get(PENDING_COOKIE)?.value ?? null;
}

export async function clearPending() {
  (await cookies()).delete(PENDING_COOKIE);
}

const signUpSchema = z
  .object({
    email,
    password: z.string(),
    confirm: z.string(),
  })
  .refine((v) => v.password.length >= MIN_PASSWORD_LENGTH, {
    message: `Your password needs ${MIN_PASSWORD_LENGTH} characters or more.`,
    path: ["password"],
  })
  .refine((v) => v.password === v.confirm, {
    message: "These do not match yet.",
    path: ["confirm"],
  });

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await origin()}/auth/confirm`,
      data: { role: "organisation" },
    },
  });

  if (error) return { error: error.message };

  // Supabase returns a session here only when email confirmation is switched
  // off for the project. In that case the account is already usable, and
  // sending them to "check your email" would be a dead end waiting on a
  // message nobody is going to send.
  if (data.session) redirect("/onboarding/about");

  await setPending(parsed.data.email);
  redirect("/confirm");
}

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Add your password.") })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Never disclose whether the address has an account.
  if (error) return { error: "That email address and password do not match." };

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z.object({ email }).safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // The result is deliberately ignored. The screen says the same thing
  // whether or not an account exists, so an error here must not leak that.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}/auth/reset`,
  });

  redirect(`/forgot-password?sent=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function setNewPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z
    .object({ password: z.string(), confirm: z.string() })
    .refine((v) => v.password.length >= MIN_PASSWORD_LENGTH, {
      message: `Your password needs ${MIN_PASSWORD_LENGTH} characters or more.`,
    })
    .refine((v) => v.password === v.confirm, {
      message: "These do not match yet.",
    })
    .safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // The recovery session can lapse between opening the link and submitting.
  // Supabase says "Auth session missing", which tells the person nothing and
  // does not tell them the one thing that helps: ask for another link.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "That link has expired. Ask for a new one and you can set your password from that.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  // Straight to the dashboard only if onboarding is done. The root sorts
  // that out, so a half-onboarded organisation is not dropped somewhere
  // that immediately bounces them.
  redirect("/");
}

export type ResendResult =
  | { ok: true }
  | { ok: false; error: string; signIn?: boolean };

/**
 * Re-send the confirmation email. Rate limiting is Supabase's own.
 *
 * The result is reported, unlike the password reset above. There the silence
 * is deliberate, because the screen must not reveal whether an account
 * exists. Here she has just created the account and is looking at her own
 * address on the screen, so there is nothing to protect and a failure she
 * cannot see is only a failure she repeats.
 *
 * Rate limiting is the common case by far, and it is the one where the
 * wording matters most: nothing is broken, the mail is coming, and telling
 * her to wait is more use than telling her it failed.
 */
export async function resendConfirmation(): Promise<ResendResult> {
  // Read from the cookie, never from an argument. See PENDING_COOKIE: taking
  // the address from the caller is what made this an enumeration oracle.
  const pending = await readPending();
  const parsed = email.safeParse(pending);

  if (!parsed.success) {
    return {
      ok: false,
      error: "This link has expired. Sign in, or sign up again.",
      signIn: true,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await origin()}/auth/confirm` },
  });

  if (!error) return { ok: true };

  // When this fails nothing reaches the mail provider at all, so its
  // dashboard shows no trace and this line is the only record of why. The
  // address itself is deliberately left out of it.
  console.error("resendConfirmation failed", {
    code: error.code,
    status: error.status,
    message: error.message,
  });

  if (error.status === 429 || error.code === "over_email_send_rate_limit") {
    return {
      ok: false,
      error:
        "We have sent a few of these already. Wait a couple of minutes, then try once more.",
    };
  }

  // Already confirmed, which means she can simply sign in. Matched on the
  // message as well as the code: this is the likeliest failure of the three,
  // it happens whenever she opened the link on another device, and the code
  // string is not worth staking the right wording on.
  if (
    error.code === "email_address_already_confirmed" ||
    /already .*confirmed|already registered/i.test(error.message ?? "")
  ) {
    // Now known to be confirmed, so the screen has nothing left to do.
    // Clearing this is what makes the next reload land on sign-in instead of
    // offering to resend an email that will never be sent.
    await clearPending();
    return {
      ok: false,
      error: "This address is already confirmed.",
      signIn: true,
    };
  }

  return {
    ok: false,
    error: "We could not send it just now. Try again in a moment.",
  };
}
