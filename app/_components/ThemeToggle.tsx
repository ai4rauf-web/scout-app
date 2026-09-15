"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | null;
const KEY = "scout-theme";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(null);

  useEffect(() => {
    const stored = (() => {
      try {
        const v = localStorage.getItem(KEY);
        return v === "dark" || v === "light" ? v : null;
      } catch {
        return null;
      }
    })();
    setTheme(stored);
    setMounted(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme((prev) => (prev ?? null));
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  function isDark() {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function toggle() {
    const next: Theme = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    setTheme(next);
  }

  if (!mounted) {
    return <div className="h-11 w-11" aria-hidden />;
  }

  const dark = isDark();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-accent-tint"
    >
      {dark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
