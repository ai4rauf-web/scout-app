"use client";

import { useState } from "react";
import { SCREENS, type Screen } from "../_lib/types";

/**
 * Prototype chrome, not product: a way to jump between states on a phone,
 * where the desktop rail is not shown. Opened from the Beta chip.
 */
export default function ScreenSheet({
  current, onPick, onRestart, onClose,
}: {
  current: Screen;
  onPick: (s: Screen) => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const leave = (then: () => void) => { setClosing(true); window.setTimeout(then, 220); };

  return (
    <div className="absolute inset-0 z-50">
      <button type="button" aria-label="Close" onClick={() => leave(onClose)} className={`absolute inset-0 bg-ink/35 ${closing ? "fade-out" : "fade-in"}`} />
      <div role="dialog" aria-label="Prototype screens" className={`absolute inset-x-0 bottom-0 rounded-t-[26px] bg-bg-elev px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2.5 shadow-[var(--shadow-4)] ${closing ? "sheet-down" : "sheet-up"}`}>
        <div className="mx-auto h-1 w-9 rounded-full bg-border" aria-hidden />
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Prototype screens</p>
        <ul className="mt-1">
          {SCREENS.map((s, i) => {
            const active = s.id === current;
            return (
              <li key={s.id} className="border-b border-border/70 last:border-b-0">
                <button type="button" onClick={() => leave(() => onPick(s.id))} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums ${active ? "bg-accent text-bg" : "border border-border text-muted"}`}>{i + 1}</span>
                  <span className={`flex-1 text-[14px] font-medium ${active ? "text-accent" : "text-ink"}`}>{s.label}</span>
                  <span className="text-[12px] text-muted">{s.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => leave(onRestart)} className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-border text-[13px] font-semibold text-ink">
          Restart flow
        </button>
      </div>
    </div>
  );
}
