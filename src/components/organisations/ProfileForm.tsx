"use client";

import { useActionState, useState } from "react";
import { TextAreaField, Field } from "@/components/ui/Field";
import { CheckboxGroup, RadioGroup } from "@/components/ui/Choice";
import { FormError, SubmitButton } from "@/components/ui/Form";
import { LogoField } from "@/components/organisations/LogoField";
import {
  AUDIENCES,
  AVAILABILITY,
  AVAILABILITY_NEEDS_DETAIL,
  COSTS,
  COVERAGE,
  COVERAGE_NEEDS_DETAIL,
  FORMATS,
  POSTING_FREQUENCY,
  SOLUTION_KINDS,
} from "@/lib/design/taxonomy";
import { saveProfile } from "@/app/organisation/profile/actions";
import type { FormState } from "@/app/actions";
import type { MyOrganisation } from "@/lib/data/organisations";

function Section({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-card bg-surface p-6 shadow-hairline sm:p-7">
      <div className="flex flex-col gap-[6px]">
        <h2 className="m-0 font-display text-[24px] font-normal leading-[1.2]">
          {title}
        </h2>
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.6] text-ink-70">
          {blurb}
        </p>
      </div>
      {children}
    </section>
  );
}

/**
 * Everything about the organisation that onboarding does not ask for.
 *
 * Onboarding is three short steps because a long one loses people before
 * they have an account. This is the rest, and it is deliberately after that
 * point: nobody is asked to write a mission statement before they can see
 * what they have signed up to.
 *
 * The follow-up questions appear only when the answer above them leaves
 * something open. "Several areas" needs to know which; "all of Scotland"
 * does not. Asking anyway is how a form gets a reputation for wasting time.
 */
export function ProfileForm({ organisation }: { organisation: MyOrganisation }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveProfile,
    null,
  );

  const [audiences, setAudiences] = useState<string[]>(organisation.audiences);
  const [serviceKinds, setServiceKinds] = useState<string[]>(
    organisation.service_kinds,
  );
  const [accessRoutes, setAccessRoutes] = useState<string[]>(
    organisation.access_routes,
  );
  const [costOptions, setCostOptions] = useState<string[]>(
    organisation.cost_options,
  );
  const [coverage, setCoverage] = useState(organisation.coverage ?? "");
  const [availability, setAvailability] = useState(organisation.availability ?? "");
  const [frequency, setFrequency] = useState(organisation.posting_frequency ?? "");

  const wantsCoverageDetail = COVERAGE_NEEDS_DETAIL.includes(coverage);
  const wantsAvailabilityDetail = AVAILABILITY_NEEDS_DETAIL.includes(availability);
  const wantsCostNote = costOptions.includes("there_is_a_cost");
  // "Any woman" is the whole answer. Adding one to it is what the free text
  // is for, so it only appears when the list has genuinely run out.
  const wantsAudienceOther = audiences.length > 0 && !audiences.includes("any_woman");

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <FormError message={state?.error} />

      <Section
        title="Your mission"
        blurb="What an admin reads when deciding whether to verify you, and the basis of everything we match you on. Plain words beat sector language."
      >
        <TextAreaField
          label="What does your organisation exist to do?"
          name="mission"
          rows={4}
          defaultValue={organisation.mission ?? ""}
          placeholder="e.g. We work with women across West Lothian who have been out of paid work for a year or more, and we stay with them from first conversation to first payslip."
          hint="Two or three sentences."
        />

        <TextAreaField
          label="What do you offer that others near you do not?"
          name="uniqueOffer"
          rows={3}
          defaultValue={organisation.unique_offer ?? ""}
          placeholder="e.g. We are the only service in the area that pays for childcare during the sessions themselves."
          hint="The reason a woman should come to you rather than the next result."
        />
      </Section>

      <Section
        title="Who you are here for"
        blurb="Who you are set up to serve, in your own terms. Individual listings still say who each one suits."
      >
        <CheckboxGroup
          legend="Who do you work with?"
          hint="Tick everyone you are set up for."
          name="audiences"
          options={AUDIENCES}
          selected={audiences}
          onChange={setAudiences}
          columns
        />

        {wantsAudienceOther ? (
          <Field
            label="Anyone else the list misses?"
            name="audiencesOther"
            defaultValue={organisation.audiences_other ?? ""}
            placeholder="e.g. Women in the first year of a business"
          />
        ) : null}
      </Section>

      <Section
        title="What you provide"
        blurb="The shape of what you run, so we can tell a woman what kind of thing she is looking at before she opens it."
      >
        <CheckboxGroup
          legend="What kinds of support do you offer?"
          name="serviceKinds"
          options={SOLUTION_KINDS}
          selected={serviceKinds}
          onChange={setServiceKinds}
          columns
        />

        <CheckboxGroup
          legend="How do women reach you?"
          name="accessRoutes"
          options={FORMATS}
          selected={accessRoutes}
          onChange={setAccessRoutes}
          columns
        />

        <CheckboxGroup
          legend="What does it cost?"
          name="costOptions"
          options={COSTS}
          selected={costOptions}
          onChange={setCostOptions}
        />

        {wantsCostNote ? (
          <Field
            label="Roughly how much, and is there any help with it?"
            name="costNote"
            defaultValue={organisation.cost_note ?? ""}
            placeholder="e.g. £40 for the eight weeks, waived for anyone on benefits"
            hint="A cost with no number attached is the fastest way to lose someone."
          />
        ) : null}
      </Section>

      <Section
        title="Who is eligible, and where"
        blurb="The two questions that waste the most time when they go unanswered. Your Access Zones are separate and already saved."
      >
        <RadioGroup
          legend="How far does your offer reach?"
          name="coverage"
          options={COVERAGE}
          value={coverage}
          onChange={setCoverage}
        />

        {wantsCoverageDetail ? (
          <Field
            label="Which areas, exactly?"
            name="coverageNote"
            defaultValue={organisation.coverage_note ?? ""}
            placeholder="e.g. West Lothian and the western edge of Edinburgh"
          />
        ) : null}

        <TextAreaField
          label="Who can you help?"
          name="eligibility"
          rows={3}
          defaultValue={organisation.eligibility ?? ""}
          placeholder="e.g. Women over 18 living in West Lothian. No qualifications needed and it does not matter how long you have been out of work."
        />

        <TextAreaField
          label="Who can you not help?"
          name="notEligible"
          rows={2}
          defaultValue={organisation.not_eligible ?? ""}
          placeholder="e.g. We cannot take anyone who needs childcare for under-2s, and we have no capacity outside West Lothian."
          hint="The kindest field on this form. A woman who reads this and moves on has not lost an afternoon."
        />
      </Section>

      <Section
        title="When you run, and how often you post"
        blurb="This sets what a woman can expect from you, and how often we check in."
      >
        <RadioGroup
          legend="When is your offer available?"
          name="availability"
          options={AVAILABILITY}
          value={availability}
          onChange={setAvailability}
        />

        {wantsAvailabilityDetail ? (
          <Field
            label="When, exactly?"
            name="availabilityNote"
            defaultValue={organisation.availability_note ?? ""}
            placeholder="e.g. September to May, nothing over the summer"
          />
        ) : null}

        <RadioGroup
          legend="How often do you expect to post something new?"
          hint="A best guess is fine. Nothing is held against you if it changes."
          name="postingFrequency"
          options={POSTING_FREQUENCY}
          value={frequency}
          onChange={setFrequency}
        />
      </Section>

      <Section
        title="Website and logo"
        blurb="What a woman sees beside your name, and where she goes to check you are who we say you are."
      >
        <LogoField
          defaultWebsite={organisation.website ?? ""}
          currentLogoUrl={organisation.logoUrl}
        />
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>Save</SubmitButton>
        <span className="text-[14px] text-ink-60">
          You can come back and change any of this.
        </span>
      </div>
    </form>
  );
}
