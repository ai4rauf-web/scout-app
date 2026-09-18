"use client";

import { SCREENS, type Go, type Screen } from "../_lib/types";
import { StatusBar } from "../_components/Chrome";

/** Stand-in for states that are wired into the flow but not yet built. */
export default function Placeholder({ screen, go }: { screen: Screen; go: Go }) {
  const idx = SCREENS.findIndex((s) => s.id === screen);
  const meta = SCREENS[idx];
  return (
    <div className="absolute inset-0 flex flex-col">
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-tint text-[15px] font-semibold tabular-nums text-accent">
          {idx + 1}
        </span>
        <h2 className="mt-5 text-[22px] font-medium tracking-[-0.01em] text-ink">
          {meta.label} · {meta.hint.toLowerCase()}
        </h2>
        <p className="mt-2 max-w-[260px] text-[14px] leading-[1.5] text-muted">
          This state is wired into the flow and is next in the build.
        </p>
        <button
          type="button"
          onClick={() => go("landing")}
          className="mt-7 h-11 rounded-full bg-accent px-6 text-[14px] font-semibold text-bg shadow-[var(--shadow-2)] transition-transform active:scale-95"
        >
          Back to landing
        </button>
      </div>
    </div>
  );
}
