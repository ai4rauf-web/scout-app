"use client";

import { useEffect, useRef, useState } from "react";
import { SCREENS, type Screen } from "../_lib/types";
import ThemeToggle from "./ThemeToggle";
import Landing from "../_screens/Landing";
import Placeholder from "../_screens/Placeholder";

const FRAME_W = 375;
const FRAME_H = 812;

export default function Stage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [runKey, setRunKey] = useState(0);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Fit mode: the frame keeps its true 375 × 812 layout and scales as a whole.
  useEffect(() => {
    const fit = () => {
      const availH = window.innerHeight - 40 - 64; // top pad + readout
      const availW = window.innerWidth - 264 - 64; // rail + side pad
      const s = Math.min(1, availH / FRAME_H, availW / FRAME_W);
      const clamped = Math.max(0.4, Math.round(s * 1000) / 1000);
      setScale(clamped);
      stageRef.current?.style.setProperty("--s", String(clamped));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const go = (s: Screen) => setScreen(s);
  const restart = () => {
    setScreen("landing");
    setRunKey((k) => k + 1);
  };

  return (
    <div ref={stageRef} className="stage text-ink">
      {/* Screen rail — desktop only */}
      <aside className="stage-rail sticky top-0 h-[100svh] flex-col justify-between border-r border-border bg-bg px-5 py-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Prototype
          </p>
          <p className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-ink">
            Scout
          </p>

          <nav className="mt-7 flex flex-col gap-1" aria-label="Screens">
            {SCREENS.map((s, i) => {
              const active = s.id === screen;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-colors ${
                    active
                      ? "bg-accent-tint text-accent"
                      : "text-ink-2 hover:bg-accent-tint/60"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums ${
                      active
                        ? "bg-accent text-bg"
                        : "border border-border text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">
                      {s.label}
                    </span>
                    <span className="block text-[11px] leading-tight text-muted">
                      {s.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-border text-[13px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <polyline points="3 4 3 9 8 9" />
            </svg>
            Restart flow
          </button>
          <div className="flex items-center justify-between rounded-full border border-border pl-4 pr-1">
            <span className="text-[13px] font-semibold text-ink">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Frame */}
      <div className="flex min-w-0 flex-col items-center justify-center min-[900px]:py-5">
        <div className="frame-slot">
          <div className="frame" key={runKey}>
            <div className="ambient-glow" aria-hidden />
            {screen === "landing" ? (
              <Landing go={go} />
            ) : (
              <Placeholder screen={screen} go={go} />
            )}
            <div
              className="home-indicator pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/80"
              aria-hidden
            />
          </div>
        </div>
        <p className="stage-readout mt-4 text-[11px] font-medium tabular-nums tracking-[0.06em] text-muted">
          {FRAME_W} × {FRAME_H} · {Math.round(scale * 100)}%
        </p>
      </div>
    </div>
  );
}
