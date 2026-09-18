"use client";

import { useEffect, useRef } from "react";

export type SphereMode = "listening" | "paused" | "settled";

const N = 300;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// Points spread evenly over a unit sphere, each with its own phase
const POINTS = Array.from({ length: N }, (_, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = GOLDEN * i;
  return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, ph: (i * 12.9898) % (Math.PI * 2) };
});

/**
 * Scout's voice presence: a particle sphere that breathes with the speaker.
 * Listening = lively, paused = holding its breath, settled = calm.
 */
export default function Sphere({ mode, size = 232 }: { mode: SphereMode; size?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<SphereMode>(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let angle = 0;
    let energy = 0; // eased towards the target for the current mode
    let color = getComputedStyle(canvas).color;
    let frame = 0;

    const draw = (t: number) => {
      const m = modeRef.current;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color; // follow theme changes

      const target = m === "listening" ? 1 : m === "paused" ? 0.12 : 0;
      energy += (target - energy) * 0.06;

      // A stand-in for input level: layered sines read as speech cadence
      const s = t / 1000;
      const level = energy * (0.55 + 0.25 * Math.sin(s * 5.1) + 0.2 * Math.sin(s * 8.7 + 1.3));

      angle += 0.0035 + energy * 0.006;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const tilt = 0.32, cosT = Math.cos(tilt), sinT = Math.sin(tilt);

      const c = size / 2;
      const R = size * 0.36 * (1 + level * 0.1);

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;

      for (const p of POINTS) {
        const wob = 1 + level * 0.16 * Math.sin(s * 6 + p.ph);
        // rotate around Y, then tilt around X
        const x1 = (p.x * cosA + p.z * sinA) * wob;
        const z1 = (-p.x * sinA + p.z * cosA) * wob;
        const y1 = p.y * wob;
        const y2 = y1 * cosT - z1 * sinT;
        const z2 = y1 * sinT + z1 * cosT;

        const depth = (z2 + 1.2) / 2.4; // 0 back → 1 front
        ctx.globalAlpha = 0.18 + depth * 0.72;
        const d = 0.7 + depth * 1.5;
        ctx.beginPath();
        ctx.arc(c + x1 * R, c + y2 * R, d, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!still) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className="text-accent" aria-hidden />;
}
