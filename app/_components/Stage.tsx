"use client";

import { useEffect, useRef, useState } from "react";
import { SCREENS, type Screen } from "../_lib/types";
import ThemeToggle from "./ThemeToggle";
import Landing from "../_screens/Landing";
import TextSheet from "../_screens/TextSheet";
import Answer, { type Turn, type Prov } from "../_screens/Answer";
import History from "../_screens/History";
import Voice, { HEARD_DEFAULT, cleanHeard } from "../_screens/Voice";
import { pickScript, refineScript, unsayScript, MULTI_THREAD, type Refine } from "../_lib/scripts";
import { langOf } from "../_lib/i18n";

const DEFAULT_Q = "New Emaar launches in Dubai South under 2M";
let turnSeq = 1;

const FRAME_W = 375;
const FRAME_H = 812;

export default function Stage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [runKey, setRunKey] = useState(0);
  const [scale, setScale] = useState(1);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [heard, setHeard] = useState("");
  const [voiceKey, setVoiceKey] = useState(0);
  const [prov, setProv] = useState<Prov | null>(null);
  // "Reply in English instead" holds for the rest of the thread until undone
  const [replyLock, setReplyLock] = useState<null | "en">(null);
  // The text sheet sits over whichever full screen opened it
  const [base, setBase] = useState<"landing" | "answer">("landing");
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

  const findInferred = (list: Turn[]): Prov | null => {
    for (let i = list.length - 1; i >= 0; i--) {
      const seg = list[i].script.segs.findIndex((x, n) => "kind" in x && x.kind === "inferred" && !(list[i].unsaid ?? []).includes(n));
      if (seg >= 0 && list[i].done) return { turnId: list[i].id, seg };
    }
    return null;
  };

  const makeTurn = (q: string, done = false, lock: null | "en" = replyLock): Turn => {
    const native = pickScript(q);
    const script = lock === "en" && native.lang !== "en" && native.alt ? native.alt : native;
    return { id: turnSeq++, q, qLang: langOf(q), script, done };
  };

  // Swap one turn between the user's language and English, and remember the choice
  const toggleLang = (turn: Turn) => {
    const alt = turn.script.alt;
    if (!alt) return;
    setReplyLock(alt.lang === "en" ? "en" : null);
    setTurns((t) => t.map((x) => (x.id === turn.id ? { ...x, id: turnSeq++, script: alt, done: false, unsaid: [] } : x)));
  };

  const go = (s: Screen) => {
    if (s === "landing" || s === "answer") setBase(s);
    // Arriving at the answer with nothing asked yet: resume a finished thread
    if (s === "answer" && turns.length === 0) setTurns([makeTurn(DEFAULT_Q, true)]);
    if (s === "voice") { setHeard(""); setVoiceKey((k) => k + 1); }
    if (s === "multi") {
      // The demo thread: English, then Chinese, then Arabic, already answered
      setReplyLock(null);
      setTurns(MULTI_THREAD.map((q) => makeTurn(q, true, null)));
      setBase("answer");
    }
    if (s === "provenance") {
      // Jumping here from the rail: open the card on the latest assumption, seeding a thread if needed
      let list = turns;
      let target = findInferred(list);
      if (!target) { list = [makeTurn(DEFAULT_Q, true)]; setTurns(list); target = findInferred(list); }
      setProv(target);
      setBase("answer");
    } else {
      setProv(null);
    }
    if (s === "confirm" && !heard) setHeard(HEARD_DEFAULT);
    setScreen(s);
  };

  const ask = (q: string) => {
    setDraft("");
    setTurns((t) => [...t, makeTurn(q)]);
    setBase("answer");
    setScreen("answer");
  };

  const resume = (q: string) => {
    setTurns([makeTurn(q, true)]);
    setBase("answer");
    setScreen("answer");
  };

  const refine = (turn: Turn, r: Refine) =>
    setTurns((t) => [...t, { id: turnSeq++, q: r.label, qLang: turn.qLang, derived: true, script: refineScript(turn.script, r), done: false }]);

  const unsay = (turn: Turn, seg: number) => {
    const next = unsayScript(turn.script, seg);
    setProv(null);
    setScreen("answer");
    if (next) {
      setTurns((t) => [
        ...t.map((x) => (x.id === turn.id ? { ...x, unsaid: [...(x.unsaid ?? []), seg] } : x)),
        { id: turnSeq++, q: next.q, qLang: turn.qLang, derived: true, script: next.script, done: false },
      ]);
    }
  };

  const markDone = (id: number) =>
    setTurns((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x)));

  const newChat = () => {
    setProv(null);
    setReplyLock(null);
    setTurns([]);
    setDraft("");
    setBase("landing");
    setScreen("landing");
  };

  const restart = () => {
    newChat();
    setRunKey((k) => k + 1);
  };

  const inVoice = screen === "voice" || screen === "confirm";
  const overlay = screen === "text" || screen === "history" || inVoice;
  const showing = overlay ? base : screen === "provenance" || screen === "multi" ? "answer" : screen;

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
            {showing === "landing" && (
              <Landing go={go} ask={ask} resume={resume} openText={(d) => { setDraft(d); go("text"); }} />
            )}
            {showing === "answer" && (
              <Answer
                turns={turns}
                go={go}
                onTurnDone={markDone}
                onRefine={refine}
                onFollowUp={() => go("text")}
                onVoice={() => go("voice")}
                onNewChat={newChat}
                prov={prov}
                onProvenance={(p) => { setProv(p); setScreen("provenance"); }}
                onCloseProv={() => { setProv(null); setScreen("answer"); }}
                onUnsay={unsay}
                onToggleLang={toggleLang}
              />
            )}
            {screen === "history" && (
              <History
                user="Rauf"
                current={turns.length ? { title: turns[0].q, messages: turns.length * 2 } : null}
                onClose={() => setScreen(base)}
                onOpen={resume}
                onOpenCurrent={() => go("answer")}
                onNew={newChat}
              />
            )}
            {inVoice && (
              <Voice
                key={voiceKey}
                phase={screen as "voice" | "confirm"}
                heard={heard}
                onHeard={(t) => { setHeard(t); setScreen("confirm"); }}
                onCancel={() => setScreen(base)}
                onEdit={() => { setDraft(cleanHeard(heard)); setScreen("text"); }}
                onRerecord={() => go("voice")}
                onSend={() => ask(cleanHeard(heard))}
              />
            )}
            {screen === "text" && (
              <TextSheet
                draft={draft}
                setDraft={setDraft}
                followUp={base === "answer"}
                onClose={() => setScreen(base)}
                onSend={ask}
                onVoice={() => go("voice")}
              />
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
