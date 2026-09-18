"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Go } from "../_lib/types";
import { StatusBar, FillArrow, Chevron } from "../_components/Chrome";
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

const PROMPTS = [
  "Apartments under 2M, ready this year",
  "Best communities for a family villa",
  "New off-plan launches with 20% down",
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Landing({
  go, ask, resume, openText,
}: {
  go: Go;
  ask: (q: string) => void;
  resume: (q: string) => void;
  openText: (draft: string) => void;
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

        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Scout</span>
          <span className="rounded-full bg-accent-tint px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
            Beta
          </span>
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

        {/* Continue */}
        <section className="rise px-5 pt-5" style={d(60)}>
          <button
            type="button"
            onClick={() => resume("3BR villa in JLT under 5M")}
            className="group flex w-full items-center gap-3 rounded-[14px] border border-border bg-bg-elev py-3 pl-3 pr-3 text-left shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)] active:scale-[0.99]"
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
            <span className="shrink-0 text-accent"><Chevron /></span>
          </button>
        </section>

        {/* Featured listings */}
        <section className="rise pt-7" style={d(120)}>
          <Label className="px-5">Featured · from Property Finder</Label>
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

        {/* Market insights */}
        <section className="rise px-5 pt-7" style={d(180)}>
          <Label>Market insights</Label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Insight
              title="Dubai Marina"
              sub="Avg price / sqft"
              value="−2.1%"
              tone="negative"
              chart={<Bars />}
              onTap={() => ask("Why did Dubai Marina prices drop this month?")}
            />
            <Insight
              title="Dubai South"
              sub="New launches"
              value="+29"
              tone="positive"
              chart={<Line />}
              onTap={() => ask("Show me the new launches in Dubai South")}
            />
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
                  className="grid h-11 w-11 shrink-0 place-items-center text-muted-2 transition-colors hover:text-accent"
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

function Insight({
  title, sub, value, tone, chart, onTap,
}: {
  title: string; sub: string; value: string;
  tone: "positive" | "negative"; chart: React.ReactNode; onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="rounded-[16px] border border-border bg-bg-elev p-3.5 text-left shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)] active:scale-[0.99]"
    >
      <p className="text-[12px] font-semibold text-ink">{title}</p>
      <p className="text-[11px] text-muted">{sub}</p>
      <p className={`mt-2 text-[20px] font-semibold tabular-nums tracking-[-0.01em] ${tone === "negative" ? "text-negative" : "text-positive"}`}>
        {value}
      </p>
      <div className="mt-2 h-9 text-accent">{chart}</div>
    </button>
  );
}

function Bars() {
  const h = [14, 22, 18, 30, 24, 34, 26, 20];
  return (
    <svg viewBox="0 0 120 36" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      {h.map((v, i) => (
        <rect key={i} x={i * 15 + 2} y={36 - v} width="10" height={v} rx="2.5" fill="currentColor" opacity={i === h.length - 1 ? 1 : 0.35} />
      ))}
    </svg>
  );
}

function Line() {
  return (
    <svg viewBox="0 0 120 36" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <path d="M2,30 L20,26 L38,28 L56,18 L74,21 L92,10 L118,6 L118,36 L2,36 Z" fill="currentColor" opacity="0.12" />
      <path d="M2,30 L20,26 L38,28 L56,18 L74,21 L92,10 L118,6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx="118" cy="6" r="3" fill="currentColor" />
    </svg>
  );
}
