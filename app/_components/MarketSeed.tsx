"use client";

import { useEffect, useState } from "react";

export default function MarketSeed({
  tag,
  tagTone,
  quote,
  delay,
  onTap,
}: {
  tag: string;
  tagTone: "negative" | "accent" | "positive";
  quote: string;
  query: string;
  delay: number;
  onTap: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const tagColor =
    tagTone === "negative"
      ? "text-negative"
      : tagTone === "positive"
        ? "text-positive"
        : "text-accent";

  return (
    <button
      type="button"
      onClick={onTap}
      className="group rounded-[12px] bg-accent-tint px-3 py-3 text-left transition-all duration-200 active:scale-[0.99] hover:shadow-[0_2px_8px_rgba(58,48,127,0.16)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 300ms ease, transform 300ms ease",
      }}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.1em] ${tagColor}`}
      >
        {tag}
      </p>
      <p className="mt-1.5 text-[13px] italic leading-snug text-ink">
        &ldquo;{quote}&rdquo;
      </p>
    </button>
  );
}
