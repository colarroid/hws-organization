import type { ReactNode } from "react";

type BannerProps = {
  tone: "info" | "warning";
  icon: ReactNode;
  /** The one line that says what has happened. */
  title: ReactNode;
  children: ReactNode;
  /**
   * What HWS actually asked for, word for word. Set apart rather than folded
   * into the sentence: it is the only part of this that is a instruction, and
   * an instruction buried in a paragraph gets skimmed past.
   */
  note?: string | null;
  action?: ReactNode;
};

const TONES = {
  info: {
    shell: "border-gold-300 bg-gold-200",
    badge: "bg-gold-300/50 text-gold-700",
    title: "text-ink",
    body: "text-gold-700",
    note: "border-gold-300 bg-surface/70 text-ink",
  },
  warning: {
    shell: "border-red-200 bg-red-50",
    badge: "bg-red-200/60 text-red-700",
    title: "text-red-700",
    body: "text-red-700",
    note: "border-red-200 bg-surface/70 text-ink",
  },
} as const;

/**
 * The state of things, at the top of a screen.
 *
 * Structured rather than one run-on line. The old version put the icon, the
 * headline and the explanation in a single sentence, which made everything
 * the same weight and left the reader to find the part that mattered. Now the
 * headline stands alone, the explanation sits under it, and anything HWS
 * asked for is quoted rather than paraphrased.
 */
export function Banner({ tone, icon, title, children, note, action }: BannerProps) {
  const t = TONES[tone];

  return (
    <div className={`flex flex-col gap-4 rounded-card border p-[22px] ${t.shell}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-[14px]">
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.badge}`}
          >
            {icon}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className={`text-[17px] font-bold leading-[1.35] ${t.title}`}>
              {title}
            </span>
            <span className={`max-w-[62ch] text-[15px] leading-[1.6] ${t.body}`}>
              {children}
            </span>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {note ? (
        <blockquote
          className={`m-0 rounded-control border px-4 py-3 text-[16px] leading-[1.6] ${t.note}`}
        >
          {note}
        </blockquote>
      ) : null}
    </div>
  );
}
