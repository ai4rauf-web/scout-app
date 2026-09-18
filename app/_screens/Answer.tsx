"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Go } from "../_lib/types";
import type { Refine, Script, Seg } from "../_lib/scripts";
import { StatusBar } from "../_components/Chrome";
import ComposerBar from "../_components/ComposerBar";
import ListingArt from "../_components/ListingArt";

export type Turn = {
  id: number;
  q: string;
  script: Script;
  done: boolean;
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const totalChars = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0);

export default function Answer({
  turns,
  go,
  onTurnDone,
  onRefine,
  onFollowUp,
  onVoice,
  onNewChat,
  onProvenance,
}: {
  turns: Turn[];
  go: Go;
  onTurnDone: (id: number) => void;
  onRefine: (turn: Turn, r: Refine) => void;
  onFollowUp: () => void;
  onVoice: () => void;
  onNewChat: () => void;
  onProvenance: (turnId: number, segIndex: number) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col">
      <StatusBar />

      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)]">
        <IconBtn label="Back" onClick={() => go("landing")}>
          <polyline points="15 18 9 12 15 6" />
        </IconBtn>
        <div className="flex items-center">
          <IconBtn label={saved ? "Saved" : "Save this search"} onClick={() => setSaved((v) => !v)} active={saved}>
            <path d="M6 4h12v17l-6-4-6 4z" fill={saved ? "currentColor" : "none"} />
          </IconBtn>
          <IconBtn label="Share">
            <path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M5 14v5h14v-5" />
          </IconBtn>
          {/* New chat lives here because a conversation is under way */}
          <IconBtn label="New conversation" onClick={onNewChat}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </IconBtn>
        </div>
      </header>

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto pb-[112px]">
        {turns.map((t, i) => (
          <TurnBlock
            key={t.id}
            turn={t}
            first={i === 0}
            latest={i === turns.length - 1}
            onDone={() => onTurnDone(t.id)}
            onRefine={(r) => onRefine(t, r)}
            onProvenance={(seg) => onProvenance(t.id, seg)}
          />
        ))}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 min-[900px]:pb-7">
        <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 bg-gradient-to-t from-bg via-bg/95 to-transparent" aria-hidden />
        <div className="relative">
          <ComposerBar label="Ask a follow-up…" onField={onFollowUp} onVoice={onVoice} />
        </div>
      </div>
    </div>
  );
}

function TurnBlock({
  turn, first, latest, onDone, onRefine, onProvenance,
}: {
  turn: Turn; first: boolean; latest: boolean;
  onDone: () => void; onRefine: (r: Refine) => void; onProvenance: (segIndex: number) => void;
}) {
  const { script } = turn;
  const total = totalChars(script.segs);
  const [phase, setPhase] = useState<"thinking" | "streaming" | "done">(turn.done ? "done" : "thinking");
  const [shown, setShown] = useState(turn.done ? total : 0);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<"listings" | "map" | "sources">("listings");
  const ref = useRef<HTMLElement | null>(null);

  // Bring a new turn to the top of the view
  useEffect(() => {
    if (!turn.done && !first) ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Thinking → streaming → done
  useEffect(() => {
    if (phase !== "thinking") return;
    const tick = window.setInterval(() => setStep((s) => Math.min(s + 1, script.thinking.length - 1)), 520);
    const t = window.setTimeout(() => setPhase("streaming"), 520 * script.thinking.length + 200);
    return () => { window.clearInterval(tick); window.clearTimeout(t); };
  }, [phase, script.thinking.length]);

  useEffect(() => {
    if (phase !== "streaming") return;
    const t = window.setInterval(() => setShown((n) => Math.min(total, n + 3)), 28);
    return () => window.clearInterval(t);
  }, [phase, total]);

  // Completion is reported from an effect, never from inside a state updater
  useEffect(() => {
    if (phase === "streaming" && shown >= total) {
      setPhase("done");
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shown, total]);

  const hasInferred = script.segs.some((s) => "kind" in s && s.kind === "inferred");

  return (
    <article ref={ref} className={`scroll-mt-2 px-5 ${first ? "pt-3" : "mt-8 border-t border-border pt-7"}`}>
      <h1 dir="auto" className={`font-semibold tracking-[-0.02em] text-ink ${first ? "text-[24px] leading-[1.2]" : "text-[19px] leading-[1.25]"}`}>
        {turn.q}
      </h1>

      {/* Modes */}
      <div className="mt-4 flex gap-2">
        <Chip active={tab === "listings"} onClick={() => setTab("listings")}>
          Listings <span className="tabular-nums opacity-70">· {script.count}</span>
        </Chip>
        <Chip active={tab === "map"} onClick={() => setTab("map")}>Map</Chip>
        <Chip active={tab === "sources"} onClick={() => setTab("sources")}>Sources</Chip>
      </div>

      {/* Thinking */}
      {phase === "thinking" && (
        <div className="mt-6 flex items-center gap-3" aria-live="polite">
          <span className="orb h-3 w-3 rounded-full bg-accent" aria-hidden />
          <span key={step} className="rise text-[14px] text-muted">{script.thinking[step]}…</span>
        </div>
      )}

      {/* Prose with provenance */}
      {phase !== "thinking" && (
        <p dir="auto" className={`mt-5 text-[16px] leading-[1.6] text-ink ${phase === "streaming" ? "cursor-blink" : ""}`}>
          <Prose segs={script.segs} shown={shown} onProvenance={onProvenance} />
        </p>
      )}

      {phase === "done" && (
        <>
          {hasInferred && (
            <p className="rise mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted" style={d(40)}>
              <span className="flex items-center gap-1.5"><i className="inline-block h-[2.5px] w-5 bg-stated" /> you said</span>
              <span className="flex items-center gap-1.5"><i className="inline-block w-5 border-b-[1.5px] border-dashed border-inferred" /> Scout assumed · hold to check</span>
            </p>
          )}

          {/* Listings */}
          <div className="rise -mx-5 mt-5" style={d(100)}>
            <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
              {script.listings.map((l, i) => (
                <div key={l.name} className="w-[228px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-border bg-bg-elev shadow-[var(--shadow-1)]">
                  <div className="relative h-[112px]">
                    <ListingArt variant={l.art} uid={`${turn.id}-${i}`} />
                    <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold tabular-nums text-bg">{i + 1}</span>
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <p className="truncate text-[13px] font-semibold text-ink">{l.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted">{l.meta}</p>
                    <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{l.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {latest && (
            <div className="rise mt-4 flex items-center gap-1 text-muted" style={d(160)}>
              <Action label="Compare"><rect x="4" y="5" width="6" height="14" rx="1.5" /><rect x="14" y="5" width="6" height="14" rx="1.5" /></Action>
              <Action label="Listen"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Action>
              <Action label="Copy"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Action>
            </div>
          )}

          {/* Refine */}
          {latest && script.refine.length > 0 && (
            <section className="rise mt-7" style={d(220)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Refine</p>
              <ul className="mt-1">
                {script.refine.map((r) => (
                  <li key={r.label} className="border-b border-border last:border-b-0">
                    <button type="button" onClick={() => onRefine(r)} className="group flex w-full items-center justify-between gap-3 py-3.5 text-left">
                      <span className="text-[14px] text-ink-2 transition-colors group-hover:text-ink">{r.label}</span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-accent transition-colors group-hover:bg-accent-tint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </article>
  );
}

/** Reveals segments up to `shown` characters; underlined phrases respond to a long-press. */
function Prose({ segs, shown, onProvenance }: { segs: Seg[]; shown: number; onProvenance: (i: number) => void }) {
  let left = shown;
  return (
    <>
      {segs.map((s, i) => {
        if (left <= 0) return null;
        const text = s.t.slice(0, left);
        left -= s.t.length;
        if (!("kind" in s)) return <span key={i}>{text}</span>;
        if (s.kind === "cite") {
          return (
            <span key={i} className="mx-[2px] inline-grid h-[18px] min-w-[18px] -translate-y-[1px] place-items-center rounded-full bg-accent-tint px-1 align-middle text-[10px] font-bold tabular-nums text-accent">
              {text}
            </span>
          );
        }
        if (s.kind === "stated") return <span key={i} className="prov-stated">{text}</span>;
        return <Held key={i} onHold={() => onProvenance(i)}>{text}</Held>;
      })}
    </>
  );
}

function Held({ children, onHold }: { children: React.ReactNode; onHold: () => void }) {
  const [pressing, setPressing] = useState(false);
  const timer = useRef<number | null>(null);
  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  };
  const start = () => {
    setPressing(true);
    timer.current = window.setTimeout(() => { clear(); onHold(); }, 420);
  };
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Scout assumed this. Hold to see why."
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHold(); } }}
      className={`no-select prov-inferred cursor-pointer rounded-[3px] transition-colors ${pressing ? "bg-accent-tint" : ""}`}
    >
      {children}
    </span>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full px-3.5 text-[12px] font-semibold transition-colors ${
        active ? "bg-accent-tint text-accent ring-1 ring-inset ring-accent/30" : "border border-border text-ink-2 hover:border-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-accent-tint active:scale-95 ${active ? "text-accent" : "text-ink"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function Action({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button type="button" className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors hover:bg-accent-tint hover:text-accent">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
      {label}
    </button>
  );
}
