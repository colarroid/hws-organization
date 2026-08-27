"use client";

import { useState } from "react";
import { PasswordField } from "@/components/ui/Field";
import { MIN_PASSWORD_LENGTH } from "@/lib/design/taxonomy";

type PasswordFieldsProps = {
  passwordLabel?: string;
  confirmLabel?: string;
};

/**
 * The password pair, shared by sign up and by setting a new password.
 *
 * Validation is live on every keystroke rather than on blur. There is no
 * resting hint: the placeholder already states the length, so the field only
 * speaks once there is something to say, red while short and green once it is
 * long enough. Length is the only rule.
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
      ? undefined
      : remaining > 0
        ? `Too short. ${remaining} more to go.`
        : "Long enough.";
  const hintTone = remaining > 0 ? "error" : "success";

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <>
      <PasswordField
        label={passwordLabel}
        name="password"
        autoComplete="new-password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={hint}
        hintTone={hintTone}
      />
      <PasswordField
        label={confirmLabel}
        name="confirm"
        autoComplete="new-password"
        placeholder="Type it again"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? "These do not match yet." : undefined}
      />
    </>
  );
}
