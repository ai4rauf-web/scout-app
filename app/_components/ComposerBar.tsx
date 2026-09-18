"use client";

import { useEffect, useState } from "react";
import { WaveformIcon } from "./Chrome";

const HINTS = [
  "Ask Scout",
  "اسأل سكاوت",
  "问问 Scout",
  "Ask about any community…",
];

/**
 * The resting composer. It is a launcher, not a field:
 * the pill opens the text sheet, the waveform opens voice.
 */
export default function ComposerBar({
  onField,
  onVoice,
  label,
  chip = "EN",
}: {
  onField: () => void;
  onVoice: () => void;
  label?: string;
  /** The language Scout is currently replying in */
  chip?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (label) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % HINTS.length), 2800);
    return () => window.clearInterval(t);
  }, [label]);

  const hint = label ?? HINTS[i];
  const rtl = /[؀-ۿ]/.test(hint);

  return (
    <div className="scout-hairline flex items-center gap-1 rounded-full p-1 shadow-[var(--shadow-2)]">
      <span className="grid h-11 w-11 shrink-0 place-items-center text-[11px] font-bold tracking-[0.04em] text-accent">
        {chip}
      </span>
      <span className="h-6 w-px shrink-0 bg-border" aria-hidden />
      <button
        type="button"
        onClick={onField}
        className="h-11 min-w-0 flex-1 truncate px-3 text-start text-[15px] text-muted"
        dir={rtl ? "rtl" : "ltr"}
        aria-label="Ask Scout — type your question"
      >
        <span key={hint} className="rise inline-block">
          {hint}
        </span>
      </button>
      <button
        type="button"
        onClick={onVoice}
        aria-label="Ask with your voice"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent-tint active:scale-95"
      >
        <WaveformIcon />
      </button>
      <button
        type="button"
        onClick={onField}
        aria-label="Write a message"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-bg shadow-[var(--shadow-2)] transition-transform active:scale-95"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
}
