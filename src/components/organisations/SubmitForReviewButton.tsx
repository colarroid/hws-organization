"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { submitForReview } from "@/app/solutions/actions";

export function SubmitForReviewButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="inline"
      disabled={pending}
      className="px-7 py-4 text-[17px]"
      onClick={() => startTransition(() => submitForReview(listingId))}
    >
      {pending ? "Submitting…" : "Submit for review"}
    </Button>
  );
}
