"use client";

export default function RecentChip({
  when,
  title,
  onResume,
}: {
  when: string;
  title: string;
  onResume: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onResume}
      className="group flex w-full items-center gap-3 rounded-[12px] border border-border bg-bg-elev py-2.5 pl-3 pr-3 text-left transition-all duration-200 active:scale-[0.99] hover:border-accent hover:shadow-[0_2px_8px_rgba(58,48,127,0.12)]"
    >
      <div className="h-8 w-[3px] rounded-full bg-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
          Continue · {when}
        </p>
        <p className="mt-[1px] truncate text-[13px] font-medium text-ink">
          {title}
        </p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
        aria-hidden
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
