"use client";

import { useActionState, useState } from "react";
import { Field, PasswordField } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { inviteColleague } from "@/app/organisation/actions";
import {
  joinWithNewPassword,
  joinWithPassword,
} from "@/app/invite/[token]/actions";
import type { FormState } from "@/app/actions";

/** The form on the organisation page. */
export function InviteColleagueForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    inviteColleague,
    null,
  );

  return (
    <form action={formAction} className="flex w-full max-w-[420px] flex-col gap-[14px]">
      <FormError message={state?.error} />
      <Field
        label="Their work email address"
        name="email"
        type="email"
        autoComplete="off"
        placeholder="colleague@yourorganisation.org"
        required
      />
      <SubmitButton>Send the invitation</SubmitButton>
    </form>
  );
}

/**
 * The two ways in, on the invitation screen.
 *
 * Which one applies is the person's own statement, not something looked up
 * for them. The portal has no way to ask whether an address already has an
 * account, and it should not have one: that question is an account
 * enumeration oracle wherever it is answered.
 */
export function AcceptInvitationForms({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");

  const [state, formAction] = useActionState<FormState, FormData>(
    mode === "new" ? joinWithNewPassword : joinWithPassword,
    null,
  );

  const tab =
    "min-h-[44px] flex-1 cursor-pointer rounded-control border-0 px-4 py-[10px] text-[15px] " +
    "transition-[color,background-color] duration-150 ease-out";

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="How you are joining"
        className="flex gap-2 rounded-control bg-gold-200 p-1"
      >
        <button
          type="button"
          onClick={() => setMode("new")}
          aria-pressed={mode === "new"}
          className={`${tab} ${
            mode === "new"
              ? "bg-surface font-semibold text-ink shadow-hairline"
              : "bg-transparent font-medium text-gold-700"
          }`}
        >
          I&apos;m new here
        </button>
        <button
          type="button"
          onClick={() => setMode("existing")}
          aria-pressed={mode === "existing"}
          className={`${tab} ${
            mode === "existing"
              ? "bg-surface font-semibold text-ink shadow-hairline"
              : "bg-transparent font-medium text-gold-700"
          }`}
        >
          I already have an account
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-[22px]">
        <FormError message={state?.error} />
        <input type="hidden" name="token" value={token} />
        {/* Fixed to the invited address. Editable, this would be a way to
            create an account for someone else's email. */}
        <input type="hidden" name="email" value={email} />

        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold">Email</span>
          <span className="rounded-control bg-surface p-4 text-[17px] text-ink-70 shadow-hairline">
            {email}
          </span>
        </div>

        <PasswordField
          label={mode === "new" ? "Choose a password" : "Your password"}
          name="password"
          autoComplete={mode === "new" ? "new-password" : "current-password"}
          required
        />

        <SubmitButton>
          {mode === "new" ? "Create my account and join" : "Sign in and join"}
        </SubmitButton>
      </form>
    </div>
  );
}
