import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { SolutionForm } from "@/components/organisations/SolutionForm";
import { getMyOrganisation, getSituations } from "@/lib/data/organisations";

export default async function NewSolutionPage() {
  const organisation = await getMyOrganisation();
  if (!organisation) redirect("/onboarding/about");

  const situations = await getSituations();

  return (
    <Page width={720} top={56} gap={28}>
      <Link
        href="/dashboard"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        My solutions
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[42px] font-medium leading-[1.1] tracking-[-0.01em]">
          Post a solution
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Everything here is what a woman reads before she decides. Write it for
          someone who has never heard of your organisation.
        </p>
      </div>

      <SolutionForm situations={situations} />
    </Page>
  );
}
