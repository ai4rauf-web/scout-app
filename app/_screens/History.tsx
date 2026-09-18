"use client";

import { useState } from "react";
import { StatusBar, Chevron } from "../_components/Chrome";
import { NewChatGlyph } from "./Answer";

type Row = { title: string; meta: string };

const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: "Today",
    rows: [
      { title: "New Emaar launches in Dubai South under 2M", meta: "2:14 PM · 6 messages" },
      { title: "Compare Marina vs JBR for a 2BR", meta: "11:02 AM · 12 messages" },
    ],
  },
  {
    label: "Yesterday",
    rows: [
      { title: "3BR villa in JLT under 5M", meta: "Yesterday · 9 messages" },
      { title: "Off-plan launches under 20% down", meta: "Yesterday · 4 messages" },
    ],
  },
  {
    label: "Earlier",
    rows: [
      { title: "Best communities for a family villa", meta: "Sep 12 · 15 messages" },
      { title: "Rental yield in Business Bay", meta: "Sep 9 · 3 messages" },
    ],
  },
];

/**
 * Full width, not a drawer: picking a conversation closes the list by itself,
 * so there is never a panel left open to dismiss.
 */
export default function History({
  user, current, onClose, onOpen, onOpenCurrent, onNew,
}: {
  user: string;
  current: { title: string; messages: number } | null;
  onClose: () => void;
  onOpen: (title: string) => void;
  onOpenCurrent: () => void;
  onNew: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const leave = (then: () => void) => { setClosing(true); window.setTimeout(then, 220); };

  return (
    <div className={`absolute inset-0 z-40 flex flex-col bg-bg ${closing ? "slide-out-left" : "slide-in-left"}`} role="dialog" aria-label="Your conversations">
      <StatusBar />

      <header className="relative flex h-14 shrink-0 items-center justify-center px-4 pt-[env(safe-area-inset-top)]">
        <button type="button" onClick={() => leave(onClose)} aria-label="Close" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-accent-tint active:scale-95">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Conversations</h1>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
        {/* Identity — a quiet row, not a card. Signing out is rare, so it sits back. */}
        <section className="rise flex items-center gap-3 py-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-semibold text-bg">{user[0]}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold leading-tight text-ink">{user}</span>
            <span className="block truncate text-[12px] text-muted">{signedOut ? "Signed out in this demo only" : "Signed in with Google"}</span>
          </span>
          <button type="button" onClick={() => setSignedOut((v) => !v)} className="-mr-2 shrink-0 px-2 py-2 text-[12px] font-medium text-muted transition-colors hover:text-ink">
            {signedOut ? "Sign in" : "Sign out"}
          </button>
        </section>

        <button type="button" onClick={() => leave(onNew)} className="rise mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-accent text-[14px] font-semibold text-accent transition-colors hover:bg-accent-tint active:scale-[0.99]" style={{ animationDelay: "40ms" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><NewChatGlyph /></svg>
          New conversation
        </button>

        {current && (
          <Group label="Now" delay={80}>
            <Item title={current.title} meta={`Open · ${current.messages} ${current.messages === 1 ? "message" : "messages"}`} live onClick={() => leave(onOpenCurrent)} />
          </Group>
        )}

        {GROUPS.map((g, gi) => (
          <Group key={g.label} label={g.label} delay={120 + gi * 50}>
            {g.rows.map((r) => (
              <Item key={r.title} title={r.title} meta={r.meta} onClick={() => leave(() => onOpen(r.title))} />
            ))}
          </Group>
        ))}
      </main>
    </div>
  );
}

function Group({ label, delay, children }: { label: string; delay: number; children: React.ReactNode }) {
  return (
    <section className="rise mt-7" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</h2>
      <ul className="mt-1">{children}</ul>
    </section>
  );
}

function Item({ title, meta, live, onClick }: { title: string; meta: string; live?: boolean; onClick: () => void }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 py-3.5 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-ink">{title}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
            {live && <i className="inline-block h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />}
            {meta}
          </span>
        </span>
        <span className="shrink-0 text-muted transition-colors group-hover:text-accent"><Chevron /></span>
      </button>
    </li>
  );
}
