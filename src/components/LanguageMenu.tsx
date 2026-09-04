"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { LOCALES, localeFor } from "@/lib/i18n/locales";
import { setLanguage } from "@/app/language";

/**
 * The language control in the top bar.
 *
 * A button and a list rather than a native select, because the closed state
 * has to be a mark and two letters rather than a full language name in a
 * platform-styled box. The cost is that everything a select gives free has to
 * be written out: Escape, click-away, focus returning to the button, and the
 * expanded state announced.
 *
 * Each row is a submit button inside one form, so choosing a language is a
 * form submission with no client-side routing. It works the same whether or
 * not the menu ever opened.
 *
 * `aria-hidden` is never used to hide the list. It is unmounted, so nothing
 * inside it can be reached by a keyboard while it is closed.
 */
export function LanguageMenu({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const active = localeFor(current);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Back to the button rather than to the top of the page, which is
      // where focus goes if the element it was on is removed.
      trigger.current?.focus();
    }

    function onPointer(event: MouseEvent) {
      if (box.current && !box.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Language: ${active.english}. Change it.`}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-[10px] py-2 text-[14px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-gold-200"
      >
        <FlagBadge badge={active.badge} />
        <span>{active.short}</span>
        <ChevronDown
          size={15}
          strokeWidth={2.5}
          aria-hidden="true"
          className={`text-ink-60 transition-transform duration-150 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <form
          action={setLanguage}
          /* Closed on submit rather than left to the re-render. The action
             changes the page around it, not this component's own state, so
             without this the menu sat open over a page that had already
             changed language underneath it. */
          onSubmit={() => setOpen(false)}
          role="menu"
          /* end rather than right, so it stays inside the bar when the
             document is flipped for Arabic or Urdu. */
          className="panel-in absolute end-0 top-[calc(100%+6px)] z-30 flex min-w-[190px] flex-col gap-[2px] rounded-card bg-surface p-2 shadow-panel"
        >
          {LOCALES.map((locale) => {
            const chosen = locale.code === current;
            return (
              <button
                key={locale.code}
                type="submit"
                name="locale"
                value={locale.code}
                role="menuitem"
                lang={locale.code}
                aria-current={chosen ? "true" : undefined}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-control border-0 px-3 py-2 text-start text-[14px] transition-colors duration-150 ease-out ${
                  chosen
                    ? "bg-gold-200 font-semibold text-ink"
                    : "bg-transparent font-medium text-ink-70 hover:bg-gold-200/60 hover:text-ink"
                }`}
              >
                <FlagBadge badge={locale.badge} />
                <span className="w-[30px] shrink-0 font-semibold">
                  {locale.short}
                </span>
                <span className="truncate">{locale.name}</span>
              </button>
            );
          })}
        </form>
      ) : null}
    </div>
  );
}
