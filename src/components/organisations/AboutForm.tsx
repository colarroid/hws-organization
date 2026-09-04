"use client";

import { useActionState, useState } from "react";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceField } from "@/components/ui/PlaceField";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { ORGANISATION_TYPES } from "@/lib/design/taxonomy";
import { saveAbout } from "@/app/onboarding/actions";
import type { FormState } from "@/app/actions";
import type { MyOrganisation } from "@/lib/data/organisations";

/**
 * Onboarding step 1.
 *
 * Collects what women see next to every listing, and says so on the screen,
 * because a field explained by its consequence gets answered better than a
 * field explained by a rule.
 */
export function AboutForm({ organisation }: { organisation: MyOrganisation | null }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveAbout,
    null,
  );
  const [types, setTypes] = useState<string[]>(organisation?.types ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-[26px]">
      <FormError message={state?.error} />
      {organisation ? (
        <input type="hidden" name="organisationId" value={organisation.id} />
      ) : null}

      <Field
        label="Organisation name"
        name="name"
        required
        defaultValue={organisation?.name ?? ""}
        placeholder="Your organisation's name"
      />

      <div className="flex flex-col gap-[10px]">
        <span className="text-[15px] font-semibold" id="org-type-label">
          What kind of organisation are you?
          {/* Required, and a chip group rather than a field, so the marker
              is written out here to match the labelled inputs. */}
          <span aria-hidden="true" className="text-gold-700"> *</span>
        </span>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Pick every one that applies. Plenty of organisations are more than
          one thing.
        </span>
        <ChipGroup label="What kind of organisation are you?" multi>
          {ORGANISATION_TYPES.map((option) => (
            <Chip
              key={option.slug}
              label={option.label}
              selected={types.includes(option.slug)}
              multi
              onToggle={() =>
                setTypes((current) =>
                  current.includes(option.slug)
                    ? current.filter((slug) => slug !== option.slug)
                    : [...current, option.slug],
                )
              }
            />
          ))}
        </ChipGroup>
        {/* One input per choice, so the action reads them with getAll. */}
        {types.map((slug) => (
          <input key={slug} type="hidden" name="types" value={slug} />
        ))}
      </div>

      {/* The website is asked for on the profile instead, where it doubles as
          the source of the logo. Asking here as well made it two questions. */}
      <PlaceField
        label="Where you are based"
        name="place"
        defaultValue={organisation?.place ?? ""}
        placeholder="e.g. Glasgow City"
      />

      <TextAreaField
        label="In one sentence, what does your organisation do?"
        name="blurb"
        rows={2}
        defaultValue={organisation?.blurb ?? ""}
        placeholder="e.g. We help women in West Lothian back into paid work after a career break."
        hint="Plain words work best. Women searching may not know the terms your sector uses."
      />

      <SubmitButton>Next</SubmitButton>
    </form>
  );
}
