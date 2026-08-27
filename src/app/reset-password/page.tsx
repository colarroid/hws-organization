"use client";

import { useActionState } from "react";
import { Page } from "@/components/ui/Page";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { PasswordFields } from "@/components/organisations/PasswordFields";
import { RecoverySession } from "@/components/organisations/RecoverySession";
import { setNewPassword, type FormState } from "../actions";

/**
 * Screen 5. Set a new password.
 *
 * Reached only from the emailed link, which the route at /auth/reset exchanges
 * for a session before landing here. Same password pair and same live
 * validation as sign up.
 */
export default function ResetPasswordPage() {
  const [state, formAction] = useActionState<FormState, FormData>(
    setNewPassword,
    null,
  );

  return (
    <Page width={480}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[38px] font-normal leading-[1.1] tracking-[-0.01em]">
          Set a new password
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Setting this signs you out on other devices.
        </p>
      </div>

      <RecoverySession>
        <form action={formAction} className="flex flex-col gap-[22px]">
          <FormError message={state?.error} />
          <PasswordFields
            passwordLabel="New password"
            confirmLabel="Confirm new password"
          />
          <SubmitButton>Save and sign in</SubmitButton>
        </form>
      </RecoverySession>
    </Page>
  );
}
