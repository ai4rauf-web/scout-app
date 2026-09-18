"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SUGGESTIONS, detectLang } from "../_lib/scripts";
import { FillArrow, WaveformIcon, SimKeyboard } from "../_components/Chrome";

const PLACEHOLDERS = ["Ask Scout…", "اسأل سكاوت…", "问问 Scout…", "Ask about any community…"];

/**
 * The composer rises into a near-full-screen sheet so the question gets the
 * whole screen. It sits over whichever screen opened it.
 */
export default function TextSheet({
  draft,
  setDraft,
  followUp,
  onClose,
  onSend,
  onVoice,
}: {
  draft: string;
  setDraft: (v: string) => void;
  followUp: boolean;
  onClose: () => void;
  onSend: (q: string) => void;
  onVoice: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [ph, setPh] = useState(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus once the sheet has risen
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => window.clearTimeout(t);
  }, []);

  // Cycle the multilingual placeholder while empty
  useEffect(() => {
    if (draft) return;
    const t = window.setInterval(() => setPh((n) => (n + 1) % PLACEHOLDERS.length), 2600);
    return () => window.clearInterval(t);
  }, [draft]);

  // On a phone, keep the toolbar above the on-screen keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || window.innerWidth >= 900) return;
    const sync = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheetRef.current?.style.setProperty("--kb", `${inset}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  // Auto-grow the textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft]);

  const close = (then: () => void) => {
    setClosing(true);
    window.setTimeout(then, 230);
  };

  const send = (q: string) => {
    const text = q.trim();
    if (!text) return;
    close(() => onSend(text));
  };

  const lang = detectLang(draft);
  const hasText = draft.trim().length > 0;

  const rows = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return SUGGESTIONS.slice(0, 5);
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    const hits = SUGGESTIONS.filter((s) => words.some((w) => s.toLowerCase().includes(w)));
    return hits.slice(0, 4);
  }, [draft]);

  const placeholder = followUp ? "Ask a follow-up…" : PLACEHOLDERS[ph];

  return (
    <div className="absolute inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={() => close(onClose)}
        className={`absolute inset-0 bg-ink/35 ${closing ? "fade-out" : "fade-in"}`}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-label="Ask Scout"
        className={`absolute inset-x-0 top-[max(14px,env(safe-area-inset-top))] flex flex-col overflow-hidden rounded-t-[26px] bg-bg-elev shadow-[var(--shadow-4)] min-[900px]:top-[52px] ${
          closing ? "sheet-down" : "sheet-up"
        }`}
        style={{ bottom: "var(--kb, 0px)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border" aria-hidden />

        <div className="flex shrink-0 items-center px-4 pt-2">
          <button
            type="button"
            onClick={() => close(onClose)}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-bg text-ink transition-transform active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="shrink-0 px-5 pt-4">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            dir="auto"
            rows={1}
            placeholder={placeholder}
            aria-label="Your question"
            className="block w-full resize-none bg-transparent text-[24px] font-medium leading-[1.25] tracking-[-0.01em] text-ink caret-accent placeholder:text-muted-2 focus:outline-none"
          />
        </div>

        <div className="mx-5 mt-4 h-px shrink-0 bg-border" aria-hidden />

        {/* Recents / matches — text sends, ↖ fills */}
        <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-1">
          {rows.map((r) => (
            <li key={r} className="flex items-center border-b border-border/70 last:border-b-0">
              <button type="button" onClick={() => send(r)} className="min-w-0 flex-1 py-3.5 text-left text-[14px] text-ink-2 transition-colors hover:text-ink">
                {r}
              </button>
              <button
                type="button"
                onClick={() => { setDraft(r); inputRef.current?.focus(); }}
                aria-label={`Use “${r}” as a starting point`}
                className="grid h-11 w-11 shrink-0 place-items-center text-muted-2 transition-colors hover:text-accent"
              >
                <FillArrow />
              </button>
            </li>
          ))}
        </ul>

        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-[12px] font-semibold text-ink" title="Detected from what you type">
              <span key={lang} className="rise inline-block">{lang}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
            </span>
            <button type="button" aria-label="Attach a photo or a listing" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted transition-colors hover:text-accent">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => close(onVoice)} aria-label="Switch to voice" className="grid h-11 w-11 place-items-center rounded-full text-accent transition-colors hover:bg-accent-tint active:scale-95">
              <WaveformIcon />
            </button>
            <button
              type="button"
              onClick={() => send(draft)}
              disabled={!hasText}
              aria-label="Send"
              className={`grid h-11 w-11 place-items-center rounded-full transition-all active:scale-95 ${
                hasText ? "bg-accent text-bg shadow-[var(--shadow-2)]" : "bg-accent-tint text-muted-2"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>

        <SimKeyboard />
      </div>
    </div>
  );
}
