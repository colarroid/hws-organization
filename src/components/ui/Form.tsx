"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Just a moment…" : children}
    </Button>
  );
}

/**
 * Submission errors sit above the form and take focus, rather than flashing a
 * border. tabIndex plus role="alert" means a screen reader hears it and a
 * keyboard user lands on it.
 */
/**
 * `action` is rendered inside the alert rather than under it, so somebody on
 * a screen reader hears the way out as part of the problem. A refusal with
 * the remedy somewhere else on the page is a refusal most people read as a
 * dead end.
 */
export function FormError({
  message,
  action,
}: {
  message?: string;
  action?: React.ReactNode;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      ref={(node) => node?.focus()}
      className="flex flex-col items-start gap-1 rounded-control border border-red-200 bg-red-50 px-4 py-3 text-[15px] leading-[1.5] text-red-700"
    >
      <span>{message}</span>
      {action}
    </div>
  );
}
