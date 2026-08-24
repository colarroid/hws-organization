"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await origin()}/auth/confirm`,
      data: { role: "organisation" },
    },
  });

  if (error) return { error: error.message };

  redirect(`/confirm?email=${encodeURIComponent(parsed.data.email)}`);
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
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

/** Re-send the confirmation email. Rate limiting is Supabase's own. */
export async function resendConfirmation(address: string) {
  const parsed = email.safeParse(address);
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await origin()}/auth/confirm` },
  });
}
