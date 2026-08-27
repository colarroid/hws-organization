import Link from "next/link";
import { BadgeCheck, Clock, TriangleAlert } from "lucide-react";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Where verification has got to, in all four states it can be in.
 *
 * The two middle ones were never designed and had no screen at all, so an
 * organisation that failed verification saw the same "in progress" as one
 * nobody had looked at yet. Being told nothing while you wait is how a
 * legitimate organisation concludes the platform is broken and stops.
 *
 * None of these locks them out. Verification gates publishing, not access,
 * so their drafts are still there in every case.
 */
export function VerificationStatus({
  status,
  verifiedAt,
  reviewNote,
}: {
  status: string;
  verifiedAt: string | null;
  reviewNote: string | null;
}) {
  if (status === "verified") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card shadow-hairline bg-surface px-[22px] py-5">
        <span className="flex items-center gap-[10px] text-[16px] font-semibold text-green-700">
          <BadgeCheck size={18} strokeWidth={2} aria-hidden="true" />
          Verified
          {verifiedAt ? ` · confirmed ${DATE.format(new Date(verifiedAt))}` : ""}
        </span>
      </div>
    );
  }

  if (status === "more_evidence" || status === "rejected") {
    const declined = status === "rejected";
    return (
      <div
        className={`flex flex-col gap-3 rounded-card border px-[22px] py-5 ${
          declined ? "border-red-200 bg-red-50" : "border-gold-300 bg-gold-200"
        }`}
      >
        <span
          className={`flex items-center gap-[10px] text-[16px] font-bold ${
            declined ? "text-red-700" : "text-gold-700"
          }`}
        >
          <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" />
          {declined
            ? "We could not verify you yet"
            : "We need one more thing to verify you"}
        </span>

        {reviewNote ? (
          <p
            className={`m-0 max-w-[62ch] text-[16px] leading-[1.6] ${
              declined ? "text-red-700" : "text-gold-700"
            }`}
          >
            {reviewNote}
          </p>
        ) : null}

        <p
          className={`m-0 max-w-[62ch] text-[15px] leading-[1.6] ${
            declined ? "text-red-700" : "text-gold-700"
          }`}
        >
          Nothing you have written is lost, and this is not permanent. Reply to
          the email we sent and a person will look again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-gold-300 bg-gold-200 px-[22px] py-5">
      <span className="flex items-center gap-[10px] text-[16px] font-semibold text-gold-700">
        <Clock size={18} strokeWidth={2} aria-hidden="true" />
        Verification in progress
      </span>
      <Link
        href="/onboarding/verify"
        className="p-1 text-[15px] font-bold text-gold-700 no-underline"
      >
        Check what we have
      </Link>
    </div>
  );
}
