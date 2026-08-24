"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Page } from "@/components/ui/Page";
import { Field } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { PasswordFields } from "@/components/organisations/PasswordFields";
import { signUp, type FormState } from "../actions";

/**
 * Screen 1. List your support.
 *
 * Leads with what the organisation gets, not with what we need from them.
 * The closing panel sets expectations about review and re-confirmation up
 * front, because an organisation that discovers the review step after
 * writing three listings is an organisation that stops.
 *
 * Google sign-in was removed by decision, so this is the only route in and
 * every account goes through a confirmed work address.
 */
export default function SignUpPage() {
  const [state, formAction] = useActionState<FormState, FormData>(signUp, null);

  return (
    <Page width={480}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[40px] font-medium leading-[1.1] tracking-[-0.01em]">
          Get Started
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Create your account, then tell us about your organisation. It takes
          four short steps.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-[22px]">
        <FormError message={state?.error} />

        <Field
          label="Work email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@organisation.org"
          emphasis
          required
          hint="Use an address at your organisation's domain if you have one. It speeds up verification."
        />

        <PasswordFields />

        <SubmitButton>Create account</SubmitButton>
      </form>

      <Link
        href="/sign-in"
        className="self-center p-1 text-[15px] font-bold text-gold-700 no-underline"
      >
        I already have an account
      </Link>
    </Page>
  );
}
