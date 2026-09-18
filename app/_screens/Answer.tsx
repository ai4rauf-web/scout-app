"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Go } from "../_lib/types";
import { isInferred, type Inferred, type Refine, type Script, type Seg } from "../_lib/scripts";
import { StatusBar } from "../_components/Chrome";
import ComposerBar from "../_components/ComposerBar";
import ListingPhoto from "../_components/ListingPhoto";

export type Turn = { id: number; q: string; script: Script; done: boolean; unsaid?: number[] };
export type Prov = { turnId: number; seg: number };

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const totalChars = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0);
const DIM = "transition-opacity duration-200";

export default function Answer({
  turns, prov, go, onTurnDone, onRefine, onFollowUp, onVoice, onNewChat, onProvenance, onCloseProv, onUnsay,
}: {
  turns: Turn[];
  prov: Prov | null;
  go: Go;
  onTurnDone: (id: number) => void;
  onRefine: (turn: Turn, r: Refine) => void;
  onFollowUp: () => void;
  onVoice: () => void;
  onNewChat: () => void;
  onProvenance: (p: Prov) => void;
  onCloseProv: () => void;
  onUnsay: (turn: Turn, seg: number) => void;
}) {
  const [saved, setSaved] = useState(false);
  const dim = prov !== null;

  return (
    <div
      className="absolute inset-0 flex flex-col"
      // While the card is open, a tap anywhere else only dismisses it
      onClickCapture={(e) => {
        if (!dim) return;
        const el = e.target as HTMLElement;
        // The card itself stays interactive; the click that follows the long-press lands on the held phrase
        if (el.closest("[data-prov-card]") || el.closest("[data-lifted]")) return;
        e.stopPropagation();
        e.preventDefault();
        onCloseProv();
      }}
    >
      <StatusBar />

      <header className={`relative z-10 flex h-14 shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)] ${DIM} ${dim ? "opacity-25" : ""}`}>
        <IconBtn label="Back" onClick={() => go("landing")}><polyline points="15 18 9 12 15 6" /></IconBtn>
        <div className="flex items-center">
          <IconBtn label={saved ? "Saved" : "Save this search"} onClick={() => setSaved((v) => !v)} active={saved}>
            <path d="M6 4h12v17l-6-4-6 4z" fill={saved ? "currentColor" : "none"} />
          </IconBtn>
          <IconBtn label="Share"><path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M5 14v5h14v-5" /></IconBtn>
          {/* New chat lives here because a conversation is under way */}
          <IconBtn label="New conversation" onClick={onNewChat}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></IconBtn>
        </div>
      </header>

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto pb-[112px] [mask-image:linear-gradient(to_bottom,transparent,black_14px)]">
        {turns.map((t, i) => (
          <TurnBlock
            key={t.id}
            turn={t}
            first={i === 0}
            latest={i === turns.length - 1}
            dim={dim}
            activeSeg={prov?.turnId === t.id ? prov.seg : null}
            onDone={() => onTurnDone(t.id)}
            onRefine={(r) => onRefine(t, r)}
            onProvenance={(seg) => onProvenance({ turnId: t.id, seg })}
            onCloseProv={onCloseProv}
            onUnsay={(seg) => onUnsay(t, seg)}
          />
        ))}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 min-[900px]:pb-7">
        <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 bg-gradient-to-t from-bg via-bg/95 to-transparent" aria-hidden />
        <div className={`relative ${DIM} ${dim ? "opacity-25" : ""}`}>
          <ComposerBar label="Ask a follow-up…" onField={onFollowUp} onVoice={onVoice} />
        </div>
      </div>
    </div>
  );
}

function TurnBlock({
  turn, first, latest, dim, activeSeg, onDone, onRefine, onProvenance, onCloseProv, onUnsay,
}: {
  turn: Turn; first: boolean; latest: boolean; dim: boolean; activeSeg: number | null;
  onDone: () => void; onRefine: (r: Refine) => void; onProvenance: (seg: number) => void;
  onCloseProv: () => void; onUnsay: (seg: number) => void;
}) {
  const { script } = turn;
  const total = totalChars(script.segs);
  const [phase, setPhase] = useState<"thinking" | "streaming" | "done">(turn.done ? "done" : "thinking");
  const [shown, setShown] = useState(turn.done ? total : 0);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<"listings" | "map" | "sources">("listings");
  const ref = useRef<HTMLElement | null>(null);
  const off = dim ? "opacity-25" : "";

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
    if (phase === "streaming" && shown >= total) { setPhase("done"); onDone(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shown, total]);

  const hasInferred = script.segs.some((s) => isInferred(s));
  const active = activeSeg !== null ? script.segs[activeSeg] : null;

  return (
    <article ref={ref} className={`relative scroll-mt-2 px-5 ${first ? "pt-3" : "mt-8 border-t border-border pt-7"}`}>
      <h1 dir="auto" className={`font-semibold tracking-[-0.02em] text-ink ${DIM} ${off} ${first ? "text-[24px] leading-[1.2]" : "text-[19px] leading-[1.25]"}`}>
        {turn.q}
      </h1>

      <div className={`mt-4 flex gap-2 ${DIM} ${off}`}>
        <Chip active={tab === "listings"} onClick={() => setTab("listings")}>Listings <span className="tabular-nums opacity-70">· {script.count}</span></Chip>
        <Chip active={tab === "map"} onClick={() => setTab("map")}>Map</Chip>
        <Chip active={tab === "sources"} onClick={() => setTab("sources")}>Sources</Chip>
      </div>

      {phase === "thinking" && (
        <div className="mt-6 flex items-center gap-3" aria-live="polite">
          <span className="orb h-3 w-3 rounded-full bg-accent" aria-hidden />
          <span key={step} className="rise text-[14px] text-muted">{script.thinking[step]}…</span>
        </div>
      )}

      {phase !== "thinking" && (
        <p dir="auto" className={`mt-5 text-[16px] leading-[1.6] text-ink ${phase === "streaming" ? "cursor-blink" : ""}`}>
          <Prose segs={script.segs} shown={shown} dim={dim} activeSeg={activeSeg} unsaid={turn.unsaid ?? []} onProvenance={onProvenance} />
        </p>
      )}

      {/* Provenance card — sits right under the prose it explains */}
      {isInferred(active) && activeSeg !== null && (
        <ProvCard seg={active} noun={script.noun} count={script.count} onKeep={onCloseProv} onUnsay={() => onUnsay(activeSeg)} />
      )}

      {phase === "done" && (
        <>
          {hasInferred && (
            <p className={`rise mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted ${DIM} ${off}`} style={d(40)}>
              <span className="flex items-center gap-1.5"><i className="inline-block h-[2.5px] w-5 bg-stated" /> you said</span>
              <span className="flex items-center gap-1.5"><i className="inline-block w-5 border-b-[1.5px] border-dashed border-inferred" /> Scout assumed · hold to check</span>
            </p>
          )}

          <div className={`rise -mx-5 mt-5 ${DIM} ${off}`} style={d(100)}>
            <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
              {script.listings.map((l, i) => (
                <div key={l.name} className="w-[228px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-border bg-bg-elev shadow-[var(--shadow-1)]">
                  <div className="relative h-[112px]">
                    <ListingPhoto src={l.img} alt={l.name} />
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

          {latest && (
            <div className={`rise mt-4 flex items-center gap-1 text-muted ${DIM} ${off}`} style={d(160)}>
              <Action label="Compare"><rect x="4" y="5" width="6" height="14" rx="1.5" /><rect x="14" y="5" width="6" height="14" rx="1.5" /></Action>
              <Action label="Listen"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Action>
              <Action label="Copy"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Action>
            </div>
          )}

          {latest && script.refine.length > 0 && (
            <section className={`rise mt-7 ${DIM} ${off}`} style={d(220)}>
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

/** Reveals segments up to `shown` characters. With the card open, everything but the held phrase recedes. */
function Prose({
  segs, shown, dim, activeSeg, unsaid, onProvenance,
}: { segs: Seg[]; shown: number; dim: boolean; activeSeg: number | null; unsaid: number[]; onProvenance: (i: number) => void }) {
  let left = shown;
  return (
    <>
      {segs.map((s, i) => {
        if (left <= 0) return null;
        const text = s.t.slice(0, left);
        left -= s.t.length;
        const off = dim && i !== activeSeg ? "opacity-25" : "";
        if (!("kind" in s)) return <span key={i} className={`${DIM} ${off}`}>{text}</span>;
        if (s.kind === "cite") {
          return (
            <span key={i} className={`mx-[2px] inline-grid h-[18px] min-w-[18px] -translate-y-[1px] place-items-center rounded-full bg-accent-tint px-1 align-middle text-[10px] font-bold tabular-nums text-accent ${DIM} ${off}`}>
              {text}
            </span>
          );
        }
        if (s.kind === "stated") return <span key={i} className={`prov-stated ${DIM} ${off}`}>{text}</span>;
        // An assumption the user dropped stays visible, struck out — the old answer no longer claims it
        if (unsaid.includes(i)) return <span key={i} className={`text-muted-2 line-through decoration-muted-2 ${DIM} ${off}`}>{text}</span>;
        return <Held key={i} lifted={i === activeSeg} className={`${DIM} ${off}`} onHold={() => onProvenance(i)}>{text}</Held>;
      })}
    </>
  );
}

function Held({
  children, onHold, lifted, className,
}: { children: React.ReactNode; onHold: () => void; lifted: boolean; className: string }) {
  const [pressing, setPressing] = useState(false);
  const timer = useRef<number | null>(null);
  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  };
  const start = () => {
    setPressing(true);
    timer.current = window.setTimeout(() => {
      clear();
      try { navigator.vibrate?.(12); } catch {}
      onHold();
    }, 420);
  };
  return (
    <span
      data-lifted={lifted ? "" : undefined}
      role="button"
      tabIndex={0}
      aria-label="Scout assumed this. Hold to see why."
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHold(); } }}
      className={`no-select prov-inferred cursor-pointer rounded-[3px] ${className} ${pressing || lifted ? "bg-accent-tint" : ""}`}
    >
      {children}
    </span>
  );
}

function ProvCard({
  seg, noun, count, onKeep, onUnsay,
}: {
  seg: Inferred;
  noun: string; count: number;
  onKeep: () => void; onUnsay: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const diff = seg.without - count;

  // Point the caret at the held phrase and make sure the card is in view
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const held = card.parentElement?.querySelector<HTMLElement>("[data-lifted]");
    if (held) {
      const rects = held.getClientRects();
      const last = rects[rects.length - 1];
      const box = card.getBoundingClientRect();
      const scale = box.width / card.offsetWidth || 1; // the desktop frame is scaled
      const x = (last.left + last.width / 2 - box.left) / scale;
      setCaret(Math.max(22, Math.min(card.offsetWidth - 22, x)));
    }
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div ref={ref} data-prov-card className="rise relative z-30 mt-3 rounded-[16px] border border-border bg-bg-elev shadow-[var(--shadow-3)]" role="dialog" aria-label="Why Scout assumed this">
      {caret !== null && (
        <span className="absolute -top-[7px] h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-bg-elev" style={{ left: caret }} aria-hidden />
      )}
      <div className="relative overflow-hidden rounded-[16px] py-4 pl-5 pr-4">
        <span className="absolute inset-y-0 left-0 w-1 bg-inferred" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Scout assumed this from</p>
        <p className="mt-1.5 text-[15px] font-semibold text-ink">“{seg.from}”</p>
        <p className="mt-2 text-[13px] leading-[1.5] text-ink-2">{seg.why}</p>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={onUnsay} className="h-10 rounded-full bg-accent px-4 text-[13px] font-semibold text-bg shadow-[var(--shadow-2)] transition-transform active:scale-95">
            Unsay “{seg.t}”
          </button>
          <button type="button" onClick={onKeep} className="h-10 rounded-full px-3 text-[13px] font-semibold text-muted transition-colors hover:text-ink">
            Keep it
          </button>
        </div>

        <p className="mt-3 rounded-[10px] bg-accent-tint px-3 py-2 text-[12px] font-medium text-accent">
          Without it: <span className="tabular-nums">{seg.without}</span> {noun}
          <span className="tabular-nums opacity-80"> · {diff >= 0 ? "+" : "−"}{Math.abs(diff)}</span>
        </p>
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`h-8 rounded-full px-3.5 text-[12px] font-semibold transition-colors ${active ? "bg-accent-tint text-accent ring-1 ring-inset ring-accent/30" : "border border-border text-ink-2 hover:border-accent/40"}`}>
      {children}
    </button>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-accent-tint active:scale-95 ${active ? "text-accent" : "text-ink"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
    </button>
  );
}

function Action({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button type="button" className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors hover:bg-accent-tint hover:text-accent">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
      {label}
    </button>
  );
}
