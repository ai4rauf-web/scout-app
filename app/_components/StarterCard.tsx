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
      className="whitespace-nowrap rounded-full bg-accent-tint/60 px-3.5 py-2 text-[13px] font-medium text-ink/80 transition-colors active:scale-[0.99] hover:bg-accent-tint hover:text-ink"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 300ms ease, transform 300ms ease, background-color 150ms ease, color 150ms ease",
      }}
    >
      {text}
    </button>
  );
}
