"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Page } from "@/components/ui/Page";
import { Field, PasswordField } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { signIn, type FormState } from "../actions";

/**
 * Screen 3. Sign in.
 *
 * Google was removed by decision, so email and password is the only route.
 * The failure message never distinguishes a wrong password from an address
 * with no account.
 */
export default function SignInPage() {
  const [state, formAction] = useActionState<FormState, FormData>(signIn, null);

  return (
    <Page width={480}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[40px] font-medium leading-[1.1] tracking-[-0.01em]">
          Sign in
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Manage your listings and post new ones.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-[22px]">
        <FormError message={state?.error} />

        <Field
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@organisation.org"
          emphasis
          required
        />

        <div className="flex flex-col gap-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
          <Link
            href="/forgot-password"
            className="self-start p-1 text-[15px] font-bold text-gold-700 no-underline"
          >
            Forgotten your password?
          </Link>
        </div>

        <SubmitButton>Sign in</SubmitButton>
      </form>

      {/* The question is plain text and only the action is the link, so the
          link's accessible name is the action itself rather than a sentence. */}
      <p className="m-0 self-center text-[15px] font-normal text-ink-70">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="inline-flex min-h-[44px] items-center p-1 font-bold text-gold-700 no-underline"
        >
          Create Account
        </Link>
      </p>
    </Page>
  );
}
