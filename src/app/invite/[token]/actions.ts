"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/design/taxonomy";
import type { FormState } from "@/app/actions";

const joinSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string(),
  })
  .refine((v) => v.password.length >= MIN_PASSWORD_LENGTH, {
    message: `Your password needs ${MIN_PASSWORD_LENGTH} characters or more.`,
    path: ["password"],
  });

/**
 * Redeem, once there is a session.
 *
 * The database decides, not this function: `redeem_invitation` checks the
 * token, the expiry, and that the address signed in is the address invited.
 * A forwarded email is worth nothing to whoever opened it.
 */
async function redeem(token: string): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_invitation", { p_token: token });
  return error ? error.message : null;
}

/**
 * The colleague already has an account.
 *
 * Sign in, then redeem. Nothing here says whether the address had an account
 * before: the two buttons on the screen are the person's own statement about
 * which they are, not something we looked up for them.
 */
export async function joinWithPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = joinSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: "That email address and password do not match." };

  const failure = await redeem(parsed.data.token);
  if (failure) return { error: failure };

  redirect("/dashboard");
}

/**
 * The colleague is new.
 *
 * Signs them up as an organisation account and redeems in the same step. The
 * address is fixed to the one that was invited and is not editable on the
 * form, so this cannot be used to create an account for anyone else.
 *
 * Email confirmation is skipped in effect: they arrived by clicking a link
 * sent to that address, which is the same proof a confirmation email asks
 * for. If the project has confirmation switched on, Supabase returns no
 * session and they are told to confirm first.
 */
export async function joinWithNewPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = joinSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { role: "organisation" } },
  });

  if (error) {
    // The likeliest cause by far is an address that already has an account,
    // and the other button is the answer to that.
    return {
      error:
        "We could not create that account. If you already have one, sign in instead.",
    };
  }

  if (!data.session) {
    return {
      error:
        "Check your email to confirm the address, then open this invitation again.",
    };
  }

  const failure = await redeem(parsed.data.token);
  if (failure) return { error: failure };

  redirect("/onboarding/about");
}

/** Already signed in as the invited address: one button, no credentials. */
export async function acceptInvitation(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const failure = await redeem(token);
  if (failure) redirect(`/invite/${token}?error=${encodeURIComponent(failure)}`);
  redirect("/dashboard");
}
