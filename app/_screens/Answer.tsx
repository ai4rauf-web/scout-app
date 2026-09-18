"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Go } from "../_lib/types";
import { isInferred, nounFor, type Inferred, type Listing, type Refine, type Script, type Seg } from "../_lib/scripts";
import { STR, chipLabel, isRtl, langName, type Lang } from "../_lib/i18n";
import { loadVoices, pickVoice, tune } from "../_lib/voice";
import { StatusBar } from "../_components/Chrome";
import ComposerBar from "../_components/ComposerBar";
import ListingPhoto from "../_components/ListingPhoto";

export type Turn = {
  id: number;
  q: string;
  /** Language the user wrote in — may differ from the reply language when they lock replies to English. */
  qLang: Lang;
  script: Script;
  done: boolean;
  unsaid?: number[];
  /** Refine / Unsay turns inherit their parent's language and never announce a switch. */
  derived?: boolean;
};
export type Prov = { turnId: number; seg: number };

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const totalChars = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0);
const DIM = "transition-opacity duration-200";

export default function Answer({
  turns, prov, go, onTurnDone, onRefine, onDig, onFollowUp, onVoice, onNewChat, onProvenance, onCloseProv, onUnsay, onToggleLang,
}: {
  turns: Turn[];
  prov: Prov | null;
  go: Go;
  onTurnDone: (id: number) => void;
  onRefine: (turn: Turn, r: Refine) => void;
  onDig: (turn: Turn, listing: number) => void;
  onFollowUp: () => void;
  onVoice: () => void;
  onNewChat: () => void;
  onProvenance: (p: Prov) => void;
  onCloseProv: () => void;
  onUnsay: (turn: Turn, seg: number) => void;
  onToggleLang: (turn: Turn) => void;
}) {
  const [saved, setSaved] = useState(false);
  // WhatsApp leaves the app, so the prototype only says what would happen
  const [toast, setToast] = useState<string | null>(null);
  // The full list belongs to one turn, so it opens in that turn's language
  const [listFor, setListFor] = useState<Turn | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);
  // Navigation stays in the app's own direction so Back never changes sides mid-thread.
  // Only the places you read and write follow the language: each turn, and the composer.
  const current: Lang = turns.length ? turns[turns.length - 1].script.lang : "en";
  const home: Lang = turns.length ? turns[0].qLang : "en";
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
          <IconBtn label="New conversation" onClick={onNewChat}><NewChatGlyph /></IconBtn>
        </div>
      </header>

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto pb-[136px] [mask-image:linear-gradient(to_bottom,transparent,black_14px)]">
        {turns.map((t, i) => (
          <TurnBlock
            key={t.id}
            turn={t}
            first={i === 0}
            latest={i === turns.length - 1}
            prevQLang={i > 0 ? turns[i - 1].qLang : null}
            home={home}
            onToggleLang={() => onToggleLang(t)}
            dim={dim}
            activeSeg={prov?.turnId === t.id ? prov.seg : null}
            onDone={() => onTurnDone(t.id)}
            onRefine={(r) => onRefine(t, r)}
            onDig={(i) => onDig(t, i)}
            onWhatsApp={(name) => setToast(STR[t.script.lang].waToast(name))}
            onNotify={setToast}
            onSeeAll={() => setListFor(t)}
            onProvenance={(seg) => onProvenance({ turnId: t.id, seg })}
            onCloseProv={onCloseProv}
            onUnsay={(seg) => onUnsay(t, seg)}
          />
        ))}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 min-[900px]:pb-4">
        <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 bg-gradient-to-t from-bg via-bg/95 to-transparent" aria-hidden />
        <div role="status" className="pointer-events-none absolute inset-x-4 -top-9 flex justify-center">
          {toast && <span className="rise rounded-full bg-ink px-3.5 py-2 text-[12px] font-medium text-bg shadow-[var(--shadow-3)]">{toast}</span>}
        </div>
        <div dir={isRtl(current) ? "rtl" : "ltr"} lang={current} className={`relative ${DIM} ${dim ? "opacity-25" : ""}`}>
          <ComposerBar label={STR[current].followUp} chip={chipLabel[current]} onField={onFollowUp} onVoice={onVoice} />
          {/* Where the live Scout keeps it: under the composer, only once there is an answer to doubt */}
          <p className="mt-2 text-center text-[11px] leading-none text-muted">{STR[current].disclaimer}</p>
        </div>
      </div>

      {listFor && (
        <AllListings
          turn={listFor}
          onClose={() => setListFor(null)}
          onDig={(i) => { const t = listFor; setListFor(null); onDig(t, i); }}
        />
      )}
    </div>
  );
}

function TurnBlock({
  turn, first, latest, prevQLang, home, onToggleLang, dim, activeSeg, onDone, onRefine, onDig, onWhatsApp, onNotify, onSeeAll, onProvenance, onCloseProv, onUnsay,
}: {
  turn: Turn; first: boolean; latest: boolean; dim: boolean; activeSeg: number | null;
  prevQLang: Lang | null; home: Lang; onToggleLang: () => void;
  onDone: () => void; onRefine: (r: Refine) => void; onDig: (listing: number) => void; onWhatsApp: (name: string) => void; onNotify: (msg: string) => void; onSeeAll: () => void; onProvenance: (seg: number) => void;
  onCloseProv: () => void; onUnsay: (seg: number) => void;
}) {
  const { script } = turn;
  const L = STR[script.lang];
  const switched = !turn.derived && prevQLang !== null && prevQLang !== turn.qLang;
  const total = totalChars(script.segs);
  const [phase, setPhase] = useState<"thinking" | "streaming" | "done">(turn.done ? "done" : "thinking");
  const [shown, setShown] = useState(turn.done ? total : 0);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<"listings" | "map" | "sources">("listings");
  const [marketOpen, setMarketOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // What Scout would say aloud: the answer without citation numbers or anything the user has unsaid
  const spoken = script.segs
    .filter((seg, i) => !("kind" in seg && seg.kind === "cite") && !(turn.unsaid ?? []).includes(i))
    .map((seg) => seg.t).join("").replace(/\s+([.。])/g, "$1").trim();

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  const listen = async () => {
    if (speaking) return stopSpeaking();
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setSpeaking(true);
    // The voice follows the turn, so an Arabic answer is read in Arabic, by a clear male voice where the device has one
    const { voice, male } = pickVoice(await loadVoices(), script.lang);
    const u = new SpeechSynthesisUtterance(spoken);
    if (voice) u.voice = voice;
    u.lang = voice?.lang.replace("_", "-") ?? L.speech;
    tune(u, male);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
  };
  // Never keep talking over a new turn or after leaving the screen
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  useEffect(() => { if (!latest && speaking) stopSpeaking(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [latest]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(spoken); onNotify(L.copied); } catch { /* clipboard blocked: stay quiet */ }
  };
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
  // Never more cards than Scout says it found
  const visible = script.listings.slice(0, Math.min(script.count, script.listings.length));
  const active = activeSeg !== null ? script.segs[activeSeg] : null;

  return (
    <article
      ref={ref}
      lang={script.lang}
      dir={isRtl(script.lang) ? "rtl" : "ltr"}
      className={`relative scroll-mt-2 px-5 ${first ? "pt-3" : "mt-8 border-t border-border pt-7"}`}
    >
      {switched && (
        <LangMarker turn={turn} home={home} onToggle={onToggleLang} className={`${DIM} ${off}`} />
      )}
      <h1 dir="auto" className={`font-semibold tracking-[-0.02em] text-ink ${DIM} ${off} ${first ? "text-[24px] leading-[1.2]" : "text-[19px] leading-[1.25]"}`}>
        {turn.q}
      </h1>

      <div className={`mt-4 flex gap-2 ${DIM} ${off}`}>
        <Chip active={tab === "listings"} onClick={() => setTab("listings")}>{L.listings} <span className="tabular-nums">· {script.count}</span></Chip>
        <Chip active={tab === "map"} onClick={() => setTab("map")}>{L.map}</Chip>
        <Chip active={tab === "sources"} onClick={() => setTab("sources")}>{L.sources}</Chip>
      </div>

      {phase === "thinking" && (
        <div className="mt-6 flex items-center gap-3" aria-live="polite">
          <span className="orb h-3 w-3 rounded-full" aria-hidden />
          <span key={step} className="rise shimmer text-[14px]">{script.thinking[step]}…</span>
        </div>
      )}

      {phase !== "thinking" && (
        <p dir="auto" className={`mt-5 text-[16px] leading-[1.6] text-ink ${phase === "streaming" ? "cursor-blink" : ""}`}>
          <Prose segs={script.segs} shown={shown} dim={dim} activeSeg={activeSeg} unsaid={turn.unsaid ?? []} onProvenance={onProvenance} />
        </p>
      )}

      {/* Provenance card — sits right under the prose it explains */}
      {isInferred(active) && activeSeg !== null && (
        <ProvCard seg={active} lang={script.lang} noun={nounFor(script, active.without)} count={script.count} onKeep={onCloseProv} onUnsay={() => onUnsay(activeSeg)} />
      )}

      {phase === "done" && (
        <>
          {hasInferred && (
            <p className={`rise mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted ${DIM} ${off}`} style={d(40)}>
              <span className="flex items-center gap-1.5"><i className="inline-block h-[2.5px] w-5 bg-stated" /> {L.youSaid}</span>
              <span className="flex items-center gap-1.5"><i className="inline-block w-5 border-b-[1.5px] border-dashed border-inferred" /> {L.assumed}</span>
            </p>
          )}

          {script.market && (
            <div className={`rise mt-4 ${DIM} ${off}`} style={d(70)}>
              <button type="button" aria-expanded={marketOpen} onClick={() => setMarketOpen((v) => !v)} className="flex h-9 items-center gap-1.5 text-[13px] font-semibold text-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="4 16 9 11 13 14 20 7" /><polyline points="15 7 20 7 20 12" /></svg>
                {L.market}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${marketOpen ? "rotate-180" : ""}`} aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${marketOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!marketOpen}>
                  <dl className="scout-wash mt-1 rounded-[14px] px-4 py-1">
                    {script.market.stats.map((m) => (
                      <div key={m.label} className="flex items-baseline justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0">
                        <dt className="text-[13px] text-ink-2">{m.label}</dt>
                        <dd className={`text-[14px] font-semibold tabular-nums ${m.tone === "positive" ? "text-positive-text" : m.tone === "negative" ? "text-negative-text" : "text-ink"}`}><bdi dir="ltr">{m.value}</bdi></dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-1.5 text-[11px] text-muted">{script.market.note}</p>
                </div>
              </div>
            </div>
          )}

          <div className={`rise mt-5 flex items-center justify-between gap-3 ${DIM} ${off}`} style={d(90)}>
            <p className="min-w-0 truncate text-[12px] text-muted">{L.ranked(visible.length, script.count)}</p>
            <button type="button" onClick={onSeeAll} className="-me-2 flex h-9 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-accent">
              {L.seeAll(script.count)}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180" aria-hidden><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </div>

          <div className={`rise -mx-5 mt-1 ${DIM} ${off}`} style={d(100)}>
            <div role="group" aria-label={L.listings} className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
              {visible.map((l, i) => {
                const short = (l.local ?? l.name).split(" · ")[0];
                return (
                  <div key={l.name} className="flex w-[244px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] border border-border bg-bg-elev shadow-[var(--shadow-1)]">
                    <div className="relative h-[112px]">
                      <ListingPhoto src={l.img} alt={l.local ?? l.name} />
                      <span className="absolute start-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold tabular-nums text-bg">{i + 1}</span>
                      {l.status && <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-[3px] text-[10px] font-semibold text-white backdrop-blur-sm">{l.status}</span>}
                    </div>
                    <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
                      <p className="truncate text-[13px] font-semibold text-ink">{l.local ?? l.name}</p>
                      <p className="mt-0.5 truncate text-[12px] text-muted">{l.meta}</p>
                      {l.terms && <p className="truncate text-[12px] text-muted">{l.terms}</p>}
                      <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{l.price}</p>
                      {/* Same two actions as the live cards: talk to a person, or keep talking to Scout */}
                      <div className="mt-auto flex gap-2 pt-3">
                        <button type="button" onClick={() => onWhatsApp(short)} aria-label={`${L.whatsapp} · ${short}`} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-[12px] font-semibold text-ink-2 transition-colors hover:border-accent/40 active:scale-[0.98]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z" /></svg>
                          {L.whatsapp}
                        </button>
                        <button type="button" onClick={() => onDig(i)} aria-label={`${L.digDeeper} · ${short}`} className="h-9 flex-1 rounded-full bg-accent-tint text-[12px] font-semibold text-accent transition-transform active:scale-[0.98]">
                          {L.digDeeper}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* More matched than fit here: the last card says so and opens the rest */}
              {script.count > visible.length && (
                <button type="button" onClick={onSeeAll} className="flex w-[148px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-accent/40 px-4 text-center text-accent transition-colors hover:bg-accent-tint">
                  <span className="text-[22px] font-semibold tabular-nums leading-none">+{script.count - visible.length}</span>
                  <span className="text-[12px] font-semibold leading-[1.3]">{L.seeAll(script.count)}</span>
                </button>
              )}
            </div>
          </div>

          {latest && (
            <div className={`rise mt-4 flex items-center gap-1 text-muted ${DIM} ${off}`} style={d(160)}>
              <Action label={L.compare}><rect x="4" y="5" width="6" height="14" rx="1.5" /><rect x="14" y="5" width="6" height="14" rx="1.5" /></Action>
              {speaking ? (
                // Scout is speaking, so the gradient appears; the same button stops it
                <button type="button" onClick={listen} aria-pressed className="flex h-9 items-center gap-2 rounded-full bg-accent-tint px-3 text-[12px] font-semibold text-accent">
                  <span className="flex h-4 items-center gap-[2px]" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <i key={i} className="block h-2.5 w-[2.5px] rounded-full" style={{ background: ["#7363BA", "#9358A0", "#B34C65", "#D2412B"][i], animation: `mic-wave ${640 + i * 90}ms ease-in-out ${i * 70}ms infinite` }} />
                    ))}
                  </span>
                  {L.stop}
                </button>
              ) : (
                <Action label={L.listen} onClick={listen}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Action>
              )}
              <Action label={L.copy} onClick={copy}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Action>
            </div>
          )}

          {latest && script.ask && (
            <section className={`rise relative mt-7 overflow-hidden rounded-[16px] border border-border bg-bg-elev ps-5 pe-4 pt-3.5 shadow-[var(--shadow-1)] ${DIM} ${off}`} style={d(200)}>
              {/* Scout is the one speaking here, so the gradient appears */}
              <span className="scout-bar absolute inset-y-0 start-0 w-1" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{L.scoutAsks}</p>
              <h2 className="mt-1 text-[15px] font-semibold leading-[1.35] text-ink">{script.ask.q}</h2>
              <ul className="mt-1.5">
                {script.ask.options.map((o) => (
                  <li key={o.label} className="border-b border-border last:border-b-0">
                    <button type="button" onClick={() => (o.refine ? onRefine(o.refine) : onDig(o.dig ?? 0))} className="group flex w-full items-center gap-3 py-3 text-start">
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[14px] font-medium ${o.refine ? "text-accent" : "text-ink"}`}>{o.label}</span>
                        <span className="block truncate text-[12px] text-muted">{o.sub}</span>
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted transition-colors group-hover:text-accent rtl:rotate-180" aria-hidden><polyline points="9 6 15 12 9 18" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {latest && script.refine.length > 0 && (
            <section className={`rise mt-7 ${DIM} ${off}`} style={d(220)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{L.refine}</p>
              <ul className="mt-1">
                {script.refine.map((r) => (
                  <li key={r.label} className="border-b border-border last:border-b-0">
                    <button type="button" onClick={() => onRefine(r)} className="group flex w-full items-center justify-between gap-3 py-3.5 text-start">
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
        if (unsaid.includes(i)) return <span key={i} className={`text-muted line-through decoration-muted ${DIM} ${off}`}>{text}</span>;
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
      className={`no-select prov-inferred cursor-pointer rounded-[3px] ${className} ${pressing || lifted ? "scout-wash" : ""}`}
    >
      {children}
    </span>
  );
}

function ProvCard({
  seg, lang, noun, count, onKeep, onUnsay,
}: {
  seg: Inferred; lang: Lang;
  noun: string; count: number;
  onKeep: () => void; onUnsay: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const diff = seg.without - count;
  const L = STR[lang];

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
      <div className="relative overflow-hidden rounded-[16px] py-4 pe-4 ps-5">
        <span className="scout-bar absolute inset-y-0 start-0 w-1" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{L.provFrom}</p>
        <p dir="auto" className="mt-1.5 text-start text-[15px] font-semibold text-ink">{L.quote(seg.from)}</p>
        <p className="mt-2 text-[13px] leading-[1.5] text-ink-2">{seg.why}</p>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={onUnsay} className="min-h-10 min-w-0 rounded-full bg-accent px-4 py-2 text-[13px] leading-[1.25] font-semibold text-bg shadow-[var(--shadow-2)] transition-transform active:scale-95">
            {L.unsay(seg.t)}
          </button>
          <button type="button" onClick={onKeep} className="h-10 shrink-0 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold text-muted transition-colors hover:text-ink">
            {L.keep}
          </button>
        </div>

        <p className="mt-3 rounded-[10px] bg-accent-tint px-3 py-2 text-[12px] font-medium text-accent">
          {L.without} <span className="tabular-nums">{seg.without}</span> {noun}
          {/* Isolated left-to-right, or Arabic puts the sign on the wrong side of the number (19−) */}
          <span className="tabular-nums opacity-80"> · <bdi dir="ltr">{diff >= 0 ? "+" : "−"}{Math.abs(diff)}</bdi></span>
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

/**
 * Every match in one scannable column, best first. A carousel is for glancing;
 * this is for choosing. It stays a list of answers, not a filter panel.
 */
function AllListings({ turn, onClose, onDig }: { turn: Turn; onClose: () => void; onDig: (i: number) => void }) {
  const { script } = turn;
  const L = STR[script.lang];
  const rows: Listing[] = script.listings.slice(0, Math.min(script.count, script.listings.length));
  const [closing, setClosing] = useState(false);
  const leave = (then: () => void) => { setClosing(true); window.setTimeout(then, 200); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave(onClose); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label={L.seeAll(script.count)} lang={script.lang} dir={isRtl(script.lang) ? "rtl" : "ltr"}
      className={`absolute inset-0 z-40 flex flex-col bg-bg ${closing ? "sheet-down" : "sheet-up"}`}>
      <StatusBar />
      <header dir="ltr" className="flex h-14 shrink-0 items-center gap-1 px-3 pt-[env(safe-area-inset-top)]">
        <button type="button" autoFocus onClick={() => leave(onClose)} aria-label={L.close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-accent-tint active:scale-95">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
        </button>
        <div dir={isRtl(script.lang) ? "rtl" : "ltr"} className="min-w-0 flex-1 pe-3">
          <h2 className="truncate text-[15px] font-semibold text-ink">{turn.q}</h2>
          <p className="truncate text-[12px] text-muted">{L.ranked(rows.length, script.count)}</p>
        </div>
      </header>

      <ol className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8">
        {rows.map((l, i) => {
          const short = (l.local ?? l.name).split(" · ")[0];
          return (
            <li key={l.name} className="border-b border-border last:border-b-0">
              <button type="button" onClick={() => leave(() => onDig(i))} aria-label={`${i + 1}. ${short} · ${L.digDeeper}`} className="group flex w-full items-center gap-3 py-3 text-start">
                <span className="relative h-[60px] w-[84px] shrink-0 overflow-hidden rounded-[10px]">
                  <ListingPhoto src={l.img} alt="" eager />
                  <span className="absolute start-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold tabular-nums text-bg">{i + 1}</span>
                </span>
                <span className="min-w-0 flex-1">
                  {/* The name gets the whole line; status rides with the price so it never squeezes it */}
                  <span className="block truncate text-[14px] font-semibold text-ink">{l.local ?? l.name}</span>
                  <span className="block truncate text-[12px] text-muted">{l.meta}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-ink">{l.price}</span>
                    {l.status && <span className="shrink-0 rounded-full bg-accent-tint px-1.5 py-px text-[10px] font-semibold text-accent">{l.status}</span>}
                  </span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted transition-colors group-hover:text-accent rtl:rotate-180" aria-hidden><polyline points="9 6 15 12 9 18" /></svg>
              </button>
            </li>
          );
        })}
        {script.count > rows.length && (
          <li className="scout-wash mt-4 rounded-[14px] px-4 py-3 text-[12px] leading-[1.5] text-ink-2">{L.allNote(rows.length, script.count)}</li>
        )}
      </ol>
    </div>
  );
}

/** Compose, not plus: plus already means "add this refinement" further down the same screen. */
export function NewChatGlyph() {
  return (<><path d="M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /><path d="M17.6 3.9a1.8 1.8 0 0 1 2.5 2.5L12.5 14 9 15l1-3.5z" /></>);
}

function Action({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors hover:bg-accent-tint hover:text-accent">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
      {label}
    </button>
  );
}

/**
 * Marks the point where the conversation changed language. Scout follows
 * silently; this is the one-tap way back to the language the thread began in.
 */
function LangMarker({ turn, home, onToggle, className }: { turn: Turn; home: Lang; onToggle: () => void; className: string }) {
  const native = turn.script.lang === turn.qLang;
  const canToggle = !!turn.script.alt && home === "en" && turn.qLang !== "en";
  return (
    <div dir="ltr" className={`mb-5 flex items-center gap-3 text-[11px] text-muted ${className}`}>
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span lang={native ? turn.qLang : "en"} className="font-medium">
        {native ? STR[turn.qLang].switched : "Replying in English"}
      </span>
      {canToggle && (
        <button type="button" onClick={onToggle} className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
          {native ? "Reply in English instead" : `Follow my language · ${langName[turn.qLang]}`}
        </button>
      )}
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}
