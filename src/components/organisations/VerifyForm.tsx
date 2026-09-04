"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { saveVerification } from "@/app/onboarding/actions";
import type { FormState } from "@/app/actions";

/**
 * Onboarding step 3.
 *
 * The prototype left all four inputs uncontrolled with no value binding,
 * which the handoff flags as a defect to fix. These are real fields wired to
 * a real action.
 */
export function VerifyForm({ organisationId }: { organisationId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveVerification,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-[26px]">
      <FormError message={state?.error} />
      <input type="hidden" name="organisationId" value={organisationId} />

      <Field
        label="Charity or company number"
        name="registrationNumber"
        placeholder="e.g. SC012345"
        hint="Not registered? Tell us who funds you instead and we will follow up."
      />

      <Field
        label="Who funds you"
        name="funderNote"
        placeholder="Optional"
        hint="Only needed if you have no registration number. A sponsor, a grant-maker, or whoever pays for the work."
      />

      <div className="flex flex-col gap-[14px] sm:flex-row">
        <div className="flex-1">
          <Field
            label="Your name"
            name="contactName"
            autoComplete="name"
            required
            placeholder="Full name"
          />
        </div>
        <div className="flex-1">
          <Field
            label="Your role"
            name="contactRole"
            placeholder="e.g. Services Manager"
          />
        </div>
      </div>

      <Field
        label="Contact number for our team"
        name="contactPhone"
        type="tel"
        autoComplete="tel"
        placeholder="Phone number"
        hint="Only used by us, and never shown to women using the platform."
      />

      <SubmitButton>Submit for verification</SubmitButton>

      {/* Verification gates publishing, not access, so nobody sits waiting. */}
      <span className="text-center text-[15px] leading-[1.55] text-ink-70">
        You can start drafting solutions straight away. They go live once we
        have verified you, usually within two working days.
      </span>
    </form>
  );
}
