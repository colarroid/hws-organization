import { LanguageMenu } from "@/components/LanguageMenu";

/**
 * The bar across the top of the portal.
 *
 * Desktop only, and deliberately thin. The rail down the side is still the
 * navigation — it was chosen because this is a desk tool where the same few
 * places are returned to all day, and a top row would make those compete with
 * the page heading for one band of screen.
 *
 * What this is for is the things that belong to the whole portal rather than
 * to any one page. Before it existed the language control sat inside the
 * overview, which made it look like a setting for that screen rather than for
 * everything, and left it unreachable from anywhere else.
 *
 * Below the desktop breakpoint the header already spans the width and carries
 * the same control, so this is not rendered.
 */
export function OrgTopBar({ locale }: { locale: string }) {
  return (
    <div className="hidden h-[60px] shrink-0 items-center justify-end gap-3 border-b border-hairline bg-ground px-6 lg:flex">
      <LanguageMenu current={locale} />
    </div>
  );
}
