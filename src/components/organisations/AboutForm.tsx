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
  const [type, setType] = useState(organisation?.type ?? "");

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
        placeholder="e.g. Return to Work West Lothian"
      />

      <div className="flex flex-col gap-[10px]">
        <span className="text-[15px] font-semibold" id="org-type-label">
          What kind of organisation are you?
          {/* Required, and a chip group rather than a field, so the marker
              is written out here to match the labelled inputs. */}
          <span aria-hidden="true" className="text-gold-700"> *</span>
        </span>
        <ChipGroup label="What kind of organisation are you?" multi={false}>
          {ORGANISATION_TYPES.map((option) => (
            <Chip
              key={option.slug}
              label={option.label}
              selected={type === option.slug}
              multi={false}
              onToggle={() => setType(option.slug)}
            />
          ))}
        </ChipGroup>
        <input type="hidden" name="type" value={type} />
      </div>

      <div className="flex flex-col gap-[14px] sm:flex-row">
        <div className="flex-1">
          <Field
            label="Website"
            name="website"
            type="url"
            defaultValue={organisation?.website ?? ""}
            placeholder="www.example.org"
          />
        </div>
        <div className="flex-1">
          <PlaceField
            label="Where you are based"
            name="place"
            defaultValue={organisation?.place ?? ""}
            placeholder="e.g. Glasgow City"
          />
        </div>
      </div>

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
