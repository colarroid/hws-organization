import type { ReactNode } from "react";

type BannerProps = {
  tone: "info" | "warning";
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

const TONES = {
  info: "bg-gold-200 border-gold-300 text-gold-700",
  warning: "bg-red-50 border-red-200 text-red-700",
} as const;

export function Banner({ tone, icon, children, action }: BannerProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-5 rounded-card border px-[22px] py-5 ${TONES[tone]}`}
    >
      <span className="flex items-center gap-3 text-[16px] leading-[1.5]">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        <span>{children}</span>
      </span>
      {action}
    </div>
  );
}
