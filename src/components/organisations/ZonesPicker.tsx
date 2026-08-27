"use client";

import { useActionState, useState } from "react";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { saveZones } from "@/app/onboarding/actions";
import type { FormState } from "@/app/actions";
import type { AccessZone } from "@/lib/data/organisations";

const MAX_ALSO = 2;

type ZonesPickerProps = {
  zones: AccessZone[];
  organisationId: string;
  primaryZoneId: string | null;
  alsoZoneIds: string[];
};

/**
 * Onboarding step 2.
 *
 * One tap sets the primary zone. Subsequent taps add secondary zones, capped
 * at two. Tapping the primary clears it; tapping a secondary removes it.
 *
 * The cards are buttons whose state was conveyed only by colour and a small
 * text tag in the prototype, which the handoff flags. aria-pressed carries the
 * selection, and the accessible name says which of the two roles it holds.
 */
export function ZonesPicker({
  zones,
  organisationId,
  primaryZoneId,
  alsoZoneIds,
}: ZonesPickerProps) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveZones,
    null,
  );
  const [primary, setPrimary] = useState<string | null>(primaryZoneId);
  const [also, setAlso] = useState<string[]>(alsoZoneIds);

  function pick(id: string) {
    if (primary === id) {
      setPrimary(null);
      return;
    }
    if (also.includes(id)) {
      setAlso((current) => current.filter((z) => z !== id));
      return;
    }
    if (!primary) {
      setPrimary(id);
      return;
    }
    if (also.length < MAX_ALSO) {
      setAlso((current) => [...current, id]);
    }
  }

  const remaining = MAX_ALSO - also.length;
  const summary = !primary
    ? "Choose your primary zone first. Tap it again to change it."
    : remaining > 0
      ? `Primary zone set. You can add ${remaining} more that you work across.`
      : "Primary zone and two others set. Tap one to remove it.";

  return (
    <form action={formAction} className="flex flex-col gap-[26px]">
      <FormError message={state?.error} />
      <input type="hidden" name="organisationId" value={organisationId} />
      {primary ? (
        <input type="hidden" name="primaryZone" value={primary} />
      ) : null}
      {also.map((id) => (
        <input key={id} type="hidden" name="alsoZones" value={id} />
      ))}

      <div className="flex flex-col gap-3">
        <span className="eyebrow text-ink-60">
          Your primary zone
        </span>

        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((zone) => {
            const isPrimary = primary === zone.id;
            const isAlso = also.includes(zone.id);
            const role = isPrimary ? "Primary" : isAlso ? "Also" : null;

            return (
              <button
                key={zone.id}
                type="button"
                aria-pressed={isPrimary || isAlso}
                onClick={() => pick(zone.id)}
                className={[
                  "flex cursor-pointer flex-col gap-[5px] rounded-card p-[18px] text-left",
                  isPrimary
                    ? "shadow-hairline-ink bg-ink text-white"
                    : isAlso
                      ? "border border-gold-300 bg-gold-200 text-ink"
                      : "shadow-hairline bg-surface text-ink transition-[color,background-color,box-shadow] duration-150 ease-out hover:shadow-hairline-gold",
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-[10px]">
                  <span className="text-[17px] font-bold leading-[1.3]">
                    {zone.name}
                  </span>
                  {role ? (
                    <span
                      className={[
                        "whitespace-nowrap eyebrow",
                        isPrimary ? "text-white/75" : "text-gold-700",
                      ].join(" ")}
                    >
                      {role}
                    </span>
                  ) : null}
                </span>
                <span className="text-[14px] leading-[1.5] opacity-75">
                  {zone.focus}
                </span>
                {/* Spoken, not shown: the tag above is the visual equivalent. */}
                <span className="sr-only">
                  {isPrimary
                    ? "Selected as your primary zone"
                    : isAlso
                      ? "Selected as a zone you also work across"
                      : "Not selected"}
                </span>
              </button>
            );
          })}
        </div>

        <span aria-live="polite" className="text-[15px] text-ink-70">
          {summary}
        </span>
      </div>

      {/* Load-bearing. Housing, safety and rights, new Scots and caring have
          no zone, so this panel is the only way those organisations can list
          at all, and it has to reach a person. */}
      <div className="flex flex-col gap-2 rounded-card border border-gold-300 bg-gold-200 px-5 py-[18px]">
        <span className="text-[16px] font-bold text-gold-700">
          None of these fit?
        </span>
        <span className="text-[15px] leading-[1.55] text-gold-700">
          Housing, safety and rights, support for new Scots, and caring and
          family life do not have a zone yet. Tell us what you do and we will
          route your listing by hand while we sort this out.
        </span>
        <a
          href="/hand-routing"
          className="mt-1 self-start p-1 text-[15px] font-bold text-gold-700"
        >
          Tell us what you do
        </a>
      </div>

      <SubmitButton>Next</SubmitButton>
    </form>
  );
}
