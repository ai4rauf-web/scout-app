"use client";

import { useEffect, useState } from "react";

export default function StarterCard({
  text,
  delay,
  onTap,
}: {
  text: string;
  delay: number;
  onTap: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      type="button"
      onClick={onTap}
      className={`group flex w-full items-center justify-between rounded-[12px] border border-border bg-bg-elev px-4 py-3 text-left shadow-[0_1px_3px_rgba(58,48,127,0.06)] transition-all duration-200 active:scale-[0.99] hover:border-accent hover:bg-accent-tint hover:shadow-[0_2px_8px_rgba(58,48,127,0.12)]`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 300ms ease, transform 300ms ease",
      }}
    >
      <span className="text-[13.5px] font-medium text-ink">{text}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-accent transition-transform group-hover:translate-x-0.5"
        aria-hidden
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
