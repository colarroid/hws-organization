"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { confirmFreshness } from "@/app/dashboard/actions";

export function ConfirmFreshnessButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="inline"
      disabled={pending}
      className="whitespace-nowrap px-5 py-[13px]"
      onClick={() => startTransition(() => confirmFreshness(listingId))}
    >
      {pending ? "Saving…" : "Still accurate"}
    </Button>
  );
}
