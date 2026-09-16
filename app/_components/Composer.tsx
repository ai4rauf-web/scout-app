"use client";

import { useEffect, useRef, useState } from "react";

const CYCLE_PLACEHOLDERS = [
  "Try: villa in Jumeirah under 5M…",
  "جرّب: شقة في المارينا…",
  "Try: 2BR near a metro station…",
  "అపార్ట్‌మెంట్ ఇన్ డౌన్‌టౌన్…",
];

const MOCK_TRANSCRIPT = "Show me a 3BR apartment in Dubai Marina under 2M";

export default function Composer({
  pending,
  onSubmit,
}: {
  pending: string | null;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [micState, setMicState] = useState<"idle" | "listening" | "transcribing">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (value || focused || micState !== "idle") return;
    const t = window.setInterval(
      () => setPhIndex((i) => (i + 1) % CYCLE_PLACEHOLDERS.length),
      2500,
    );
    return () => window.clearInterval(t);
  }, [value, focused, micState]);

  useEffect(() => {
    if (pending) setValue(pending);
  }, [pending]);

  // Cleanup timers on unmount / mic cancel
  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  function clearMicTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function submit() {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  }

  function toggleMic() {
    if (micState !== "idle") {
      // Cancel recording
      clearMicTimers();
      setMicState("idle");
      return;
    }
    setValue("");
    setMicState("listening");
    // Warm-up delay, then start transcribing char-by-char
    const start = window.setTimeout(() => {
      setMicState("transcribing");
      let i = 1;
      const step = () => {
        if (i > MOCK_TRANSCRIPT.length) {
          setMicState("idle");
          inputRef.current?.focus();
          return;
        }
        setValue(MOCK_TRANSCRIPT.slice(0, i));
        i += 1;
        const id = window.setTimeout(step, 42);
        timers.current.push(id);
      };
      step();
    }, 700);
    timers.current.push(start);
  }

  const isRecording = micState !== "idle";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-bg-elev px-1 py-1 shadow-[0_1px_3px_rgba(58,48,127,0.06)]">
      {/* Language toggle */}
      <button
        type="button"
        aria-label="Language: English"
        className="grid h-11 w-11 place-items-center rounded-full text-[11px] font-bold text-accent transition-colors hover:bg-accent-tint"
      >
        EN
      </button>

      <div className="h-6 w-px bg-border" aria-hidden />

      {/* Input area — shows waveform when listening, text when transcribing/idle */}
      <div className="relative min-w-0 flex-1 px-2">
        {micState === "listening" ? (
          <ListeningBar />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={CYCLE_PLACEHOLDERS[phIndex]}
            className="w-full bg-transparent text-[15px] italic text-ink placeholder:text-muted focus:outline-none"
            aria-label="Ask Scout"
          />
        )}
      </div>

      {/* Mic */}
      <button
        type="button"
        onClick={toggleMic}
        aria-label={isRecording ? "Stop recording" : "Voice input"}
        aria-pressed={isRecording}
        className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors ${
          isRecording
            ? "bg-negative text-white"
            : "text-ink hover:bg-accent-tint"
        }`}
      >
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full bg-negative/40"
            style={{
              animation: "mic-ping 1200ms cubic-bezier(0,0,0.2,1) infinite",
            }}
            aria-hidden
          />
        )}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
          aria-hidden
        >
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="22" />
        </svg>
      </button>

      {/* Send */}
      <button
        type="button"
        onClick={submit}
        aria-label="Send message"
        className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-[0_2px_8px_rgba(58,48,127,0.30)] transition-transform active:scale-95 ${
          value.trim() ? "bg-accent" : "bg-accent/60"
        }`}
        disabled={!value.trim() || isRecording}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Animated 5-bar waveform shown while the mic is "listening" (before
 * transcription starts). Purely decorative — signals audio capture.
 */
function ListeningBar() {
  return (
    <div className="flex items-center gap-[3px] py-2.5">
      <span className="text-[13px] font-medium text-negative">
        <span className="inline-block h-2 w-2 rounded-full bg-negative align-middle" style={{ animation: "mic-dot 1s infinite" }} />
        <span className="ml-2 align-middle italic text-muted">Listening…</span>
      </span>
      <div className="ml-3 flex items-end gap-[2px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block w-[3px] rounded-full bg-accent"
            style={{
              height: `${8 + (i % 2) * 8}px`,
              animation: `mic-wave 800ms ease-in-out ${i * 90}ms infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
