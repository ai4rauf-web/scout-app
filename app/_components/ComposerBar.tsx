"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { WaveformIcon } from "./Chrome";
import { chipLabel, isRtl, langOf, type Lang } from "../_lib/i18n";

/** The invitation cycles through every language Scout speaks; the chip names the one on show. */
const HINTS: { t: string; l: Lang }[] = [
  { t: "Ask Scout", l: "en" },
  { t: "اسأل سكاوت", l: "ar" },
  { t: "问问 Scout", l: "zh" },
  { t: "Scout に聞く", l: "ja" },
  { t: "Спросите Scout", l: "ru" },
  { t: "Scout से पूछें", l: "hi" },
  { t: "Ask about any community…", l: "en" },
];

/**
 * The resting composer. It is a launcher, not a field:
 * the pill opens the text sheet, the waveform opens voice.
 */
export default function ComposerBar({
  onField,
  onVoice,
  label,
  chip,
}: {
  onField: () => void;
  onVoice: () => void;
  label?: string;
  /** The language Scout is currently replying in. Without it, the chip follows the hint. */
  chip?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (label) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % HINTS.length), 3200);
    return () => window.clearInterval(t);
  }, [label]);

  const hint = label ?? HINTS[i].t;
  const lang: Lang = label ? langOf(label) : HINTS[i].l;
  const code = chip ?? chipLabel[lang];

  return (
    <div className="scout-hairline flex items-center gap-1 rounded-full p-1 shadow-[var(--shadow-2)]">
      <span className="grid h-11 w-11 shrink-0 place-items-center text-[11px] font-bold tracking-[0.04em] text-accent" aria-hidden={!chip}>
        <span key={code} className="rise inline-block">{code}</span>
      </span>
      <span className="h-6 w-px shrink-0 bg-border" aria-hidden />
      <button
        type="button"
        onClick={onField}
        className="h-11 min-w-0 flex-1 px-3 text-start text-[15px] text-muted"
        dir={isRtl(lang) ? "rtl" : "ltr"}
        lang={lang}
        aria-label="Ask Scout — type your question"
      >
        <Ticker key={hint} text={hint} rtl={isRtl(lang)} loop={!!label} />
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

/**
 * A line that fits stays still. A line that does not slides to show its end
 * instead of being cut off, so a long sentence can always be read in full.
 */
function Ticker({ text, rtl, loop }: { text: string; rtl: boolean; loop: boolean }) {
  const box = useRef<HTMLSpanElement | null>(null);
  const inner = useRef<HTMLSpanElement | null>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!box.current || !inner.current) return;
      // Layout widths, so the desktop stage's scale does not distort the sum
      const over = inner.current.offsetWidth - box.current.clientWidth;
      setShift(over > 2 ? over + 6 : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <span ref={box} className="rise block overflow-hidden whitespace-nowrap">
      <span
        ref={inner}
        className={`inline-block ${shift ? (loop ? "ticker-loop" : "ticker-once") : ""}`}
        style={{ "--shift": `${rtl ? shift : -shift}px` } as CSSProperties}
      >
        {text}
      </span>
    </span>
  );
}
