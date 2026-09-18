"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Go } from "../_lib/types";
import { StatusBar, FillArrow } from "../_components/Chrome";
import ComposerBar from "../_components/ComposerBar";
import ThemeToggle from "../_components/ThemeToggle";
import ListingPhoto from "../_components/ListingPhoto";

const USER = "Rauf";

function greetingFor(h: number) {
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

const FEATURED = [
  { name: "Golf Views · Emaar South", meta: "2 BR · 1,474 sqft", price: "AED 1.7M", sponsored: false, img: "/listings/golf-views.jpg" },
  { name: "Marina Crown", meta: "2 BR · 1,494 sqft", price: "AED 1.9M", sponsored: true, img: "/listings/marina-crown.jpg" },
  { name: "Greenway · Emaar South", meta: "3 BR · 1,810 sqft", price: "AED 2.4M", sponsored: false, img: "/listings/greenway.jpg" },
];

type Tone = "positive" | "negative" | "neutral";
const TONE: Record<Tone, string> = { positive: "text-positive-text", negative: "text-negative-text", neutral: "text-accent" };

const INSIGHTS: { title: string; line: string; value: string; tone: Tone; glyph: GlyphKind; q: string }[] = [
  // The same five metrics the live Scout shows under Market Pulse (Sep 2026)
  { title: "New launches", line: "This month · 23 fewer", value: "22", tone: "negative", glyph: "down", q: "Show me the new launches this month" },
  { title: "Avg down payment", line: "vs 20% baseline", value: "13%", tone: "neutral", glyph: "percent", q: "Which new launches need the lowest down payment?" },
  { title: "Dubai South", line: "Hottest community · projects", value: "29", tone: "positive", glyph: "up", q: "Show me the new launches in Dubai South" },
  { title: "Off-plan momentum", line: "−1.8% vs last month", value: "71%", tone: "negative", glyph: "share", q: "Is off-plan a good idea right now?" },
  { title: "Primary market share", line: "+0.5% vs last month", value: "62%", tone: "positive", glyph: "yield", q: "How much of the market is primary sales?" },
];

const PROMPTS = [
  "Apartments under 2M, ready this year",
  "Best communities for a family villa",
  "Off-plan launches under 20% down",
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Landing({
  go, ask, resume, openText, showContinue, onDismissContinue, onOpenScreens,
}: {
  go: Go;
  ask: (q: string) => void;
  resume: (q: string) => void;
  openText: (draft: string) => void;
  showContinue: boolean;
  onDismissContinue: () => void;
  onOpenScreens: () => void;
}) {
  const [hour, setHour] = useState(19);
  useEffect(() => setHour(new Date().getHours()), []);

  return (
    <div className="absolute inset-0 flex flex-col">
      <StatusBar />

      {/* Header — profile left; "+" appears only inside an ongoing chat */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={() => go("history")}
          aria-label="Your conversations"
          className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-95"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[13px] font-semibold text-bg ring-2 ring-accent-tint">
            {USER[0]}
          </span>
        </button>

        {/* Scout presented as a Property Finder product */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pf-logo.svg" alt="Property Finder" width={64} height={26} className="h-[26px] w-auto" draggable={false} />
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">Scout</span>
          {/* Prototype only: the Beta chip opens the screen switcher, since phones have no rail */}
          <button
            type="button"
            onClick={onOpenScreens}
            aria-label="Beta. Open prototype screens"
            className="min-h-6 rounded-full bg-accent-tint px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] text-accent transition-transform active:scale-95"
          >
            Beta
          </button>
        </div>

        {/* Theme lives in the rail on desktop; on a phone it sits here */}
        <div className="h-11 w-11 min-[900px]:invisible">
          <ThemeToggle />
        </div>
      </header>

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto pb-[104px]">
        {/* Greeting */}
        <section className="rise px-5 pt-5" style={d(0)}>
          <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
            {greetingFor(hour)}, <span className="text-accent">{USER}</span>.
          </h1>
          <p className="mt-2 text-[15px] leading-[1.45] text-muted">
            I’m Scout. Ask me about UAE property.
          </p>
        </section>

        {/* Continue — dismissible. Closing it collapses the row so everything below rises. */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${showContinue ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          aria-hidden={!showContinue}
        >
          <div className="overflow-hidden">
            <section className="rise px-5 pt-5" style={d(60)}>
              <div className="relative flex items-stretch rounded-[14px] border border-border bg-bg-elev shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
                <button
                  type="button"
                  tabIndex={showContinue ? 0 : -1}
                  onClick={() => resume("3BR villa in JLT under 5M")}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-[14px] py-3 pl-3 pr-10 text-left active:scale-[0.995]"
                >
                  <span className="h-9 w-[3px] shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                      Continue · Yesterday
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] font-medium text-ink">
                      3BR villa in JLT under 5M
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  tabIndex={showContinue ? 0 : -1}
                  onClick={onDismissContinue}
                  aria-label="Dismiss this suggestion"
                  className="absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Featured listings */}
        <section className="rise pt-7" style={d(120)}>
          <Label className="px-5">Featured properties · suggested for you</Label>
          <div className="no-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
            {FEATURED.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => ask(`Tell me about ${f.name}`)}
                className="w-[212px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-border bg-bg-elev text-left shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)] active:scale-[0.99]"
              >
                <div className="relative h-[104px] w-full overflow-hidden">
                  <ListingPhoto src={f.img} alt={f.name} />
                  {f.sponsored && (
                    <span className="absolute left-2 top-2 rounded-full bg-bg-elev/90 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Sponsored
                    </span>
                  )}
                </div>
                <div className="px-3 pb-3 pt-2.5">
                  <p className="truncate text-[13px] font-semibold text-ink">{f.name}</p>
                  <p className="mt-0.5 flex items-center justify-between text-[12px] text-muted">
                    <span>{f.meta}</span>
                    <span className="font-semibold text-ink">{f.price}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Market pulse — compact cards in a carousel, about half the old height */}
        <section className="rise pt-7" style={d(180)}>
          <Label className="px-5">Market pulse</Label>
          <div className="no-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
            {INSIGHTS.map((m) => (
              <button
                key={m.title}
                type="button"
                onClick={() => ask(m.q)}
                className="flex h-16 w-[248px] shrink-0 snap-start items-center gap-3 rounded-[16px] border border-border bg-bg-elev p-2.5 text-left shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)] active:scale-[0.99]"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent-tint ${TONE[m.tone]}`}>
                  <Glyph kind={m.glyph} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">{m.title}</span>
                  <span className="block truncate text-[12px] text-muted">{m.line}</span>
                </span>
                <span className={`shrink-0 pr-1 text-[15px] font-semibold tabular-nums tracking-[-0.01em] ${TONE[m.tone]}`}>{m.value}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Suggested prompts */}
        <section className="rise px-5 pt-7" style={d(240)}>
          <Label>Try asking</Label>
          <ul className="mt-1">
            {PROMPTS.map((p) => (
              <li key={p} className="flex items-center border-b border-border last:border-b-0">
                <button type="button" onClick={() => ask(p)} className="min-w-0 flex-1 py-3.5 text-left text-[14px] text-ink-2 transition-colors hover:text-ink">
                  {p}
                </button>
                <button
                  type="button"
                  onClick={() => openText(p)}
                  aria-label={`Edit “${p}” before asking`}
                  className="grid h-11 w-11 shrink-0 place-items-center text-muted transition-colors hover:text-accent"
                >
                  <FillArrow />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Composer */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 min-[900px]:pb-7">
        <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 bg-gradient-to-t from-bg via-bg/95 to-transparent" aria-hidden />
        <div className="relative">
          <ComposerBar onField={() => go("text")} onVoice={() => go("voice")} />
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.1em] text-muted ${className}`}>
      {children}
    </p>
  );
}

type GlyphKind = "down" | "up" | "percent" | "share" | "yield";

/** The square at the head of an insight card: a tiny trend line where there is a trend, an icon where there isn't. */
function Glyph({ kind }: { kind: GlyphKind }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "down") return <svg {...common}><polyline points="3 7 9 12 13 9 21 17" /><polyline points="15 17 21 17 21 11" /></svg>;
  if (kind === "up") return <svg {...common}><polyline points="3 17 9 12 13 15 21 7" /><polyline points="15 7 21 7 21 13" /></svg>;
  if (kind === "percent") return <svg {...common}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg>;
  if (kind === "share") return <svg {...common}><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></svg>;
  return <svg {...common}><path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-6h6v6" /></svg>;
}
