"use client";

import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./_components/ThemeToggle";
import Composer from "./_components/Composer";
import StarterCard from "./_components/StarterCard";
import MarketSeed from "./_components/MarketSeed";

const USER_NAME = "Rauf";

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const STARTERS = [
  "Show me apartments under 2M, ready this year",
  "Best communities for a family villa",
  "New off-plan launches with 20% down",
];

const MARKET_SEEDS = [
  {
    tag: "MARINA · -2.1%",
    tagTone: "negative" as const,
    quote: "Marina prices dropped 2%. Should we compare?",
    query: "Compare Marina to JBR for a 2BR under 2M",
  },
  {
    tag: "DUBAI STH · +29",
    tagTone: "accent" as const,
    quote: "29 new projects launched. Want a look?",
    query: "Show me the new Dubai South launches",
  },
];

export default function Home() {
  const [hour, setHour] = useState(19); // stable SSR default; corrected on client
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  const greeting = useMemo(() => greetingFor(hour), [hour]);

  function submit(text: string) {
    setPending(text);
    // TODO — navigate to /chat with initial message once Screen 2 is built
    setTimeout(() => setPending(null), 900);
  }

  return (
    <div className="relative min-h-[100svh] bg-bg text-ink">
      {/* Ambient purple glow */}
      <div className="ambient-glow" aria-hidden />

      {/* Device-frame wrapper — full width on mobile, centered phone on desktop */}
      <div className="relative mx-auto flex h-[100svh] w-full max-w-[430px] flex-col overflow-hidden md:my-6 md:h-[820px] md:max-w-[400px] md:rounded-[36px] md:border md:border-border md:shadow-[0_8px_32px_rgba(58,48,127,0.20)]">
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-3">
          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-accent-tint"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="14" y2="17" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold leading-none tracking-[-0.01em] text-ink">
              Scout
            </span>
            <span className="rounded-full bg-accent-tint px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.14em] text-accent">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              aria-label="Account"
              className="grid h-11 w-11 place-items-center rounded-full text-accent transition-colors hover:bg-accent-tint"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-tint text-sm font-bold text-accent">
                {USER_NAME[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Body — scrollable */}
        <main className="relative z-10 flex-1 overflow-y-auto px-5 pb-[136px] pt-4">
          {/* Greeting */}
          <div className="mt-6 mb-1">
            <h1 className="text-[34px] font-medium leading-[1.08] tracking-[-0.01em] text-ink">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-accent to-brand-mark bg-clip-text font-semibold text-transparent">
                {USER_NAME}
              </span>
              .
            </h1>
            <p className="mt-3 text-[15px] leading-[1.5] text-muted">
              Ask me about UAE property. I&apos;ll figure out the details as we
              talk.
            </p>
          </div>

          {/* Starter chips */}
          <SectionLabel className="mt-9">Or try</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {STARTERS.map((text, i) => (
              <StarterCard
                key={text}
                text={text}
                delay={i * 60}
                onTap={() => submit(text)}
              />
            ))}
          </div>

          {/* Market section */}
          <SectionLabel className="mt-8">In the market this week</SectionLabel>
          <div className="mt-3 grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-2">
            {MARKET_SEEDS.map((seed, i) => (
              <MarketSeed
                key={seed.tag}
                {...seed}
                delay={200 + i * 60}
                onTap={() => submit(seed.query)}
              />
            ))}
          </div>
        </main>

        {/* Composer — fixed inside the device frame */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 pt-3">
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-bg to-transparent" />
          <Composer pending={pending} onSubmit={submit} />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.14em] text-muted ${className}`}
    >
      {children}
    </p>
  );
}
