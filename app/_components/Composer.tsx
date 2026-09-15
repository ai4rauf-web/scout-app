"use client";

import { useEffect, useRef, useState } from "react";

const CYCLE_PLACEHOLDERS = [
  "Try: villa in Jumeirah under 5M…",
  "جرّب: شقة في المارينا…",
  "Try: 2BR near a metro station…",
  "అపార్ట్‌మెంట్ ఇన్ డౌన్‌టౌన్…",
];

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (value || focused) return;
    const t = setInterval(
      () => setPhIndex((i) => (i + 1) % CYCLE_PLACEHOLDERS.length),
      2500,
    );
    return () => clearInterval(t);
  }, [value, focused]);

  useEffect(() => {
    if (pending) setValue(pending);
  }, [pending]);

  function submit() {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-r-xl bg-bg-elev px-1 py-1 shadow-[0_1px_3px_rgba(58,48,127,0.08)] transition-[border-color,box-shadow] ${
        focused
          ? "ring-2 ring-accent/40 border border-accent"
          : "border border-border"
      }`}
      style={{ borderRadius: "26px" }}
    >
      {/* Language toggle */}
      <button
        type="button"
        aria-label="Language: English"
        className="grid h-11 w-11 place-items-center rounded-full text-[11px] font-bold text-accent transition-colors hover:bg-accent-tint"
      >
        EN
      </button>

      <div className="h-6 w-px bg-border" aria-hidden />

      {/* Input */}
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
        className="flex-1 bg-transparent px-2 text-[15px] italic text-ink placeholder:text-muted focus:outline-none"
        style={{ minWidth: 0 }}
        aria-label="Ask Scout"
      />

      {/* Mic */}
      <button
        type="button"
        aria-label="Voice input"
        className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-accent-tint"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        disabled={!value.trim()}
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
