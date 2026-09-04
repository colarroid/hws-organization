"use client";

import { useActionState, useState } from "react";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Form";
import { SOLUTION_KINDS, COSTS, FORMATS } from "@/lib/design/taxonomy";
import { saveSolution } from "@/app/solutions/actions";
import type { FormState } from "@/app/actions";
import type { Situation } from "@/lib/data/organisations";
import type { ListingDetail } from "@/lib/data/listings";

/** Around thirty words reads best on a phone. */
const IDEAL_WORDS = 30;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Screen 10. Post a solution.
 *
 * Collects exactly the eleven fields a woman-facing result card renders.
 *
 * Every hint explains a consequence for the woman rather than stating a rule.
 * That is deliberate: organisations write better listings when they can see
 * who is affected by a vague one.
 */
export function SolutionForm({
  situations,
  listing,
}: {
  situations: Situation[];
  listing?: ListingDetail;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveSolution,
    null,
  );

  const [kind, setKind] = useState(listing?.kind ?? "");
  const [cost, setCost] = useState(listing?.cost ?? "");
  const [formats, setFormats] = useState<string[]>(listing?.formats ?? []);
  const [tags, setTags] = useState<string[]>(listing?.situationIds ?? []);
  const [blurb, setBlurb] = useState(listing?.blurb ?? "");

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const words = countWords(blurb);

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <FormError message={state?.error} />

      {listing ? (
        <input type="hidden" name="listingId" value={listing.id} />
      ) : null}
      {/* Chip selections are React state, so they travel as hidden inputs. */}
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      {cost ? <input type="hidden" name="cost" value={cost} /> : null}
      {formats.map((f) => (
        <input key={f} type="hidden" name="formats" value={f} />
      ))}
      {tags.map((t) => (
        <input key={t} type="hidden" name="situations" value={t} />
      ))}

      <div className="flex flex-col gap-[22px]">
        <Field
          label="What is it called?"
          name="name"
          required
          defaultValue={listing?.name ?? ""}
          placeholder="e.g. Return to Work programme"
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            What kind of thing is it?
          </span>
          <ChipGroup label="What kind of thing is it?" multi={false}>
            {SOLUTION_KINDS.map((k) => (
              <Chip
                key={k.slug}
                label={k.label}
                selected={kind === k.slug}
                multi={false}
                onToggle={() => setKind(kind === k.slug ? "" : k.slug)}
              />
            ))}
          </ChipGroup>
        </div>

        <TextAreaField
          label="What does it do?"
          name="blurb"
          rows={3}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="e.g. A six-week group programme that helps women update their CV, practise interviews and meet local employers who are hiring."
          hint={`${words} ${words === 1 ? "word" : "words"}. Around ${IDEAL_WORDS} reads best on a phone.`}
        />

        <TextAreaField
          label="Who is it for?"
          name="whoFor"
          rows={2}
          defaultValue={listing?.who_for ?? ""}
          placeholder="e.g. Women aged 25 and over in West Lothian who have not worked in the last 12 months."
          hint="Be specific about eligibility. A woman who does not qualify but applies anyway loses her time and yours."
        />

        <TextAreaField
          label="What happens next for her?"
          name="whatToExpect"
          rows={2}
          defaultValue={listing?.what_to_expect ?? ""}
          placeholder="e.g. A short form, then someone phones within a week. Or: drop in any Tuesday, no need to book."
          hint="Applying, turning up, or just reading it — say what actually happens. Not knowing is the most common reason women do not act on a listing."
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">Cost</span>
          <ChipGroup label="Cost" multi={false}>
            {COSTS.map((c) => (
              <Chip
                key={c.slug}
                label={c.label}
                selected={cost === c.slug}
                multi={false}
                onToggle={() => setCost(cost === c.slug ? "" : c.slug)}
              />
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            How does she take part?
          </span>
          <ChipGroup label="How does she take part?">
            {FORMATS.map((f) => (
              <Chip
                key={f.slug}
                label={f.label}
                selected={formats.includes(f.slug)}
                onToggle={() => setFormats(toggle(formats, f.slug))}
              />
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-wrap gap-[14px]">
          <div className="min-w-[200px] flex-1">
            <Field
              label="Where"
              name="place"
              defaultValue={listing?.place ?? ""}
              placeholder="e.g. Bathgate, or Scotland-wide"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <Field
              label="Closing date"
              name="deadline"
              type="date"
              defaultValue={listing?.deadline ?? ""}
            />
          </div>
        </div>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          Leave the date blank if it runs all year. We remind women seven days
          before a closing date, and we will ask you to confirm the listing when
          it passes.
        </span>

        <Field
          label="Where should she go to apply?"
          name="applyUrl"
          defaultValue={listing?.apply_url ?? ""}
          placeholder="Link to your application page, or a phone number"
        />

        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold">
            Which situations does this suit?
          </span>
          <span className="text-[14px] leading-[1.5] text-ink-60">
            We match on these. Pick only the ones that genuinely apply, or your
            listing shows up in searches it does not fit.
          </span>
          <ChipGroup label="Which situations does this suit?">
            {situations.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                selected={tags.includes(s.id)}
                onToggle={() => setTags(toggle(tags, s.id))}
              />
            ))}
          </ChipGroup>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
        <Button
          type="submit"
          name="intent"
          value="preview"
          size="inline"
          className="px-7 py-4 text-[17px]"
        >
          Preview as she will see it
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="secondary"
          size="inline"
          className="px-[22px] py-[15px] text-[16px]"
        >
          Save as draft
        </Button>
      </div>
    </form>
  );
}
