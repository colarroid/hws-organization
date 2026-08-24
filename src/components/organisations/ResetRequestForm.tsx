"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import {
  requestPasswordReset,
  type FormState,
} from "@/app/actions";

export function ResetRequestForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    requestPasswordReset,
    null,
  );

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[38px] font-medium leading-[1.1] tracking-[-0.01em]">
          Reset your password
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Enter the address you signed up with and we will send you a link.
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
        <SubmitButton>Send me a reset link</SubmitButton>
      </form>

      {/* Say this. An organisation locked out of its account will otherwise
          assume its listings went down with it. */}
      <span className="text-[14px] leading-[1.5] text-ink-60">
        Your listings stay live while you sort this out. Nothing is taken down.
      </span>
    </div>
  );
}
