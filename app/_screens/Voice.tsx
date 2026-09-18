"use client";

import { useEffect, useState } from "react";
import { StatusBar } from "../_components/Chrome";
import Sphere from "../_components/Sphere";
import { detectLang } from "../_lib/scripts";

export const HEARD_DEFAULT =
  "Hey, I just want to know new Emaar properties launching in Dubai South under 2M";

/** Strip the conversational run-up so the answer's title is the question itself. */
export function cleanHeard(t: string) {
  const s = t
    .replace(/^(hey|hi|hello|ok(ay)?|so|um+|uh+)[,\s]+/i, "")
    .replace(/^(i\s+)?(just\s+)?(want(ed)?|would like|need)\s+to\s+(know|see|find|ask)(\s+about)?\s+/i, "")
    .replace(/^(can|could) you (show|tell|find) me\s+/i, "")
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Voice takes the whole screen — that is where speaking beats typing.
 * One component, two phases: listening, then confirm & send.
 */
export default function Voice({
  phase, heard, onHeard, onCancel, onEdit, onRerecord, onSend,
}: {
  phase: "voice" | "confirm";
  heard: string;
  onHeard: (t: string) => void;
  onCancel: () => void;
  onEdit: () => void;
  onRerecord: () => void;
  onSend: () => void;
}) {
  const words = HEARD_DEFAULT.split(" ");
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [vote, setVote] = useState<null | "up" | "down">(null);

  const listening = phase === "voice";
  const spoken = words.slice(0, count).join(" ");

  // Words arrive at a speaking pace
  useEffect(() => {
    if (!listening || paused || count >= words.length) return;
    const t = window.setTimeout(() => setCount((n) => n + 1), count === 0 ? 900 : 190);
    return () => window.clearTimeout(t);
  }, [listening, paused, count, words.length]);

  // A beat of silence ends the turn
  useEffect(() => {
    if (!listening || paused || count < words.length) return;
    const t = window.setTimeout(() => onHeard(spoken), 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, paused, count]);

  const finishNow = () => { if (count > 0) onHeard(spoken); };
  const mishear = () => { setVote("down"); setCount(0); window.setTimeout(() => setVote(null), 900); };

  const shown = listening ? spoken : heard;
  const lang = detectLang(shown);

  return (
    <div className="fade-in absolute inset-0 z-40 flex flex-col bg-bg">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <StatusBar />

      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <RoundBtn label="Cancel voice" onClick={onCancel} small>
          <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
        </RoundBtn>
        <span className="flex h-9 items-center gap-1 rounded-full border border-border bg-bg-elev px-3 text-[12px] font-semibold text-ink">
          {lang}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </header>

      {/* Sphere — tap to finish early */}
      <div className="relative z-10 mt-2 flex shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={listening ? finishNow : undefined}
          aria-label={listening ? "Finish speaking" : "Heard you"}
          className="relative grid place-items-center rounded-full transition-transform active:scale-[0.98]"
        >
          <Sphere mode={!listening ? "settled" : paused ? "paused" : "listening"} />
          <span className={`absolute grid h-14 w-14 place-items-center rounded-full bg-bg-elev text-accent shadow-[var(--shadow-3)] transition-transform duration-300 ${listening ? "" : "scale-110"}`}>
            {listening ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" stroke="none" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="rise" aria-hidden>
                <polyline points="5 12.5 10 17.5 19 7.5" />
              </svg>
            )}
          </span>
        </button>
        <p key={`${phase}-${paused}`} className="rise -mt-1 text-[13px] font-medium text-muted">
          {!listening ? "Got it. Send when you’re ready." : paused ? "Paused" : count === 0 ? "Listening…" : "Listening… tap the sphere when you’re done"}
        </p>
      </div>

      {/* Transcript */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-6 pt-7" aria-live="polite">
        {listening ? (
          <p dir="auto" className={`text-[22px] font-medium leading-[1.35] tracking-[-0.01em] text-ink ${count > 0 && count < words.length && !paused ? "cursor-blink" : ""}`}>
            {spoken || <span className="text-muted">Say what you’re looking for.</span>}
          </p>
        ) : (
          <p dir="auto" className="rise text-[20px] font-medium leading-[1.4] tracking-[-0.01em] text-ink">
            “{heard}.”
          </p>
        )}

        {listening && count > 3 && (
          <div className="rise mt-5 flex items-center gap-2">
            <Thumb dir="up" active={vote === "up"} onClick={() => setVote("up")} />
            <Thumb dir="down" active={vote === "down"} onClick={mishear} />
            <span className="ml-1 text-[12px] text-muted">{vote === "down" ? "Listening again…" : "Did I hear that right?"}</span>
          </div>
        )}

        {!listening && (
          <div className="rise mt-5 flex items-center gap-5 text-[14px] font-semibold text-accent" style={{ animationDelay: "80ms" }}>
            <button type="button" onClick={onEdit} className="underline decoration-accent/40 underline-offset-4 hover:decoration-accent">Edit</button>
            <button type="button" onClick={onRerecord} className="underline decoration-accent/40 underline-offset-4 hover:decoration-accent">Re-record</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 shrink-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-4 min-[900px]:pb-9">
        {listening ? (
          <div className="flex items-center justify-between">
            <RoundBtn label="Cancel" onClick={onCancel}>
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </RoundBtn>
            <div className="flex h-11 items-center gap-[3px] rounded-full bg-accent-tint px-5" aria-hidden>
              {Array.from({ length: 13 }).map((_, i) => (
                <span
                  key={i}
                  className="block w-[3px] rounded-full"
                  style={{
                    backgroundColor: `rgb(${Math.round(115 + (210 - 115) * (i / 12))},${Math.round(99 + (65 - 99) * (i / 12))},${Math.round(186 + (43 - 186) * (i / 12))})`,
                    height: 6 + ((i * 7) % 5) * 4,
                    animation: `mic-wave ${700 + (i % 4) * 90}ms ease-in-out ${i * 60}ms infinite`,
                    animationPlayState: paused || count === 0 ? "paused" : "running",
                    opacity: paused ? 0.4 : 1,
                  }}
                />
              ))}
            </div>
            <RoundBtn label={paused ? "Resume" : "Pause"} onClick={() => setPaused((p) => !p)}>
              {paused ? <polygon points="8 5 19 12 8 19" fill="currentColor" stroke="none" /> : (<><line x1="9" y1="6" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="18" /></>)}
            </RoundBtn>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <RoundBtn label="Discard" onClick={onCancel}>
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </RoundBtn>
            <button type="button" onClick={onSend} className="rise flex h-12 items-center gap-2 rounded-full bg-accent pl-7 pr-6 text-[15px] font-semibold text-bg shadow-[var(--shadow-3)] transition-transform active:scale-95">
              Send
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoundBtn({ children, label, onClick, small }: { children: React.ReactNode; label: string; onClick?: () => void; small?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`grid place-items-center rounded-full border border-border bg-bg-elev text-ink shadow-[var(--shadow-1)] transition-transform active:scale-95 ${small ? "h-10 w-10" : "h-12 w-12"}`}>
      <svg width={small ? 16 : 18} height={small ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function Thumb({ dir, active, onClick }: { dir: "up" | "down"; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={dir === "up" ? "Yes, that’s right" : "No, listen again"} aria-pressed={active}
      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${active ? "border-accent bg-accent-tint text-accent" : "border-border bg-bg-elev text-muted hover:text-accent"}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "down" ? "rotate(180deg)" : undefined }} aria-hidden>
        <path d="M7 11v9H4v-9h3zm0 0 4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" />
      </svg>
    </button>
  );
}
