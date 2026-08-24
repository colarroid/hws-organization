"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { MIN_PASSWORD_LENGTH } from "@/lib/design/taxonomy";

type PasswordFieldsProps = {
  passwordLabel?: string;
  confirmLabel?: string;
};

/**
 * The password pair, shared by sign up and by setting a new password.
 *
 * Validation is live on every keystroke rather than on blur. The hint changes
 * tone as it goes: neutral while empty, red while short, green once it is long
 * enough. Length is the only rule, deliberately, because the hint says a
 * memorable phrase beats a complicated word.
 */
export function PasswordFields({
  passwordLabel = "Create a password",
  confirmLabel = "Confirm password",
}: PasswordFieldsProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const remaining = MIN_PASSWORD_LENGTH - password.length;
  const hint =
    password.length === 0
      ? `Ten characters or more. A short phrase you will remember beats a complicated word.`
      : remaining > 0
        ? `Too short. ${remaining} more to go.`
        : "Long enough.";
  const hintTone =
    password.length === 0 ? "muted" : remaining > 0 ? "error" : "success";

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <>
      <Field
        label={passwordLabel}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        emphasis={passwordLabel === "New password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={hint}
        hintTone={hintTone}
      />
      <Field
        label={confirmLabel}
        name="confirm"
        type="password"
        autoComplete="new-password"
        placeholder="Type it again"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? "These do not match yet." : undefined}
      />
    </>
  );
}
