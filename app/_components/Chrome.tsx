"use client";

/** Simulated iOS status bar. Shown only inside the desktop frame — a real phone has its own. */
export function StatusBar() {
  return (
    <div dir="ltr" className="statusbar relative z-10 h-11 shrink-0 items-center justify-between px-7 pt-2 text-ink">
      <span className="text-[14px] font-semibold tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="0.7" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.7" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.7" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.7" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.8" fill="currentColor" />
          <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

/** Four-bar waveform — Scout's voice affordance in the composer. */
export function WaveformIcon({ size = 20 }: { size?: number }) {
  // Voice is how Scout hears you, so the glyph carries Scout's colours — the same ramp as the sphere
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="9" width="2.6" height="6" rx="1.3" fill="#7363BA" />
      <rect x="8.8" y="4" width="2.6" height="16" rx="1.3" fill="#9358A0" />
      <rect x="13.6" y="8" width="2.6" height="8" rx="1.3" fill="#B34C65" />
      <rect x="18.4" y="6" width="2.6" height="12" rx="1.3" fill="#D2412B" />
    </svg>
  );
}

/** ↖ — fills the composer with a suggestion without sending it. */
export function FillArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="17" y1="17" x2="7" y2="7" />
      <polyline points="7 15 7 7 15 7" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/**
 * A still keyboard for the desktop frame, so the sheet keeps its phone
 * proportions. Hidden on real phones, which bring their own.
 */
export function SimKeyboard() {
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  return (
    <div className="sim-only shrink-0 select-none bg-accent-tint px-1.5 pb-8 pt-2" aria-hidden>
      {rows.map((r, i) => (
        <div key={r} className="mb-2 flex justify-center gap-[5px]" style={{ paddingInline: i === 1 ? 16 : 0 }}>
          {i === 2 && <span className="mr-1 h-[38px] w-[40px] rounded-[6px] bg-accent-soft" />}
          {r.split("").map((k) => (
            <span key={k} className="grid h-[38px] flex-1 place-items-center rounded-[6px] bg-bg-elev text-[15px] text-ink shadow-[var(--shadow-1)]">
              {k}
            </span>
          ))}
          {i === 2 && <span className="ml-1 h-[38px] w-[40px] rounded-[6px] bg-accent-soft" />}
        </div>
      ))}
      <div className="flex gap-[5px]">
        <span className="grid h-[38px] w-[84px] place-items-center rounded-[6px] bg-accent-soft text-[13px] text-ink">123</span>
        <span className="grid h-[38px] flex-1 place-items-center rounded-[6px] bg-bg-elev text-[13px] text-muted shadow-[var(--shadow-1)]">space</span>
        <span className="grid h-[38px] w-[84px] place-items-center rounded-[6px] bg-accent-soft text-[13px] text-ink">return</span>
      </div>
    </div>
  );
}
