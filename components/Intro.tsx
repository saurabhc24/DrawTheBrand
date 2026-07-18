"use client";

import { useEffect, useRef, useState } from "react";
import { brands } from "@/lib/data";

const SEEN_KEY = "brandr:introSeen";
const DURATION = 2400;

/**
 * Once-per-session intro: a mosaic of the dataset's real brand colors pops in
 * tile by tile, holds under the wordmark, then wipes away. Plain canvas — no
 * WebGL payload for two seconds of splash. Skipped entirely for
 * reduced-motion users and on tap.
 */
export function Intro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    setVisible(true);
  }, []);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(() => setVisible(false), 250);
  };

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cols = Math.max(8, Math.round(w / 56));
    const size = w / cols;
    const rows = Math.ceil(h / size);
    const colors = brands.map((b) => b.colors[0].hex);
    const tiles: { c: number; r: number; color: string; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          c,
          r,
          color: colors[(Math.random() * colors.length) | 0],
          delay: Math.random() * 700,
        });
      }
    }

    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const tile of tiles) {
        const appear = Math.min(1, Math.max(0, (t - tile.delay) / 260));
        const gone = Math.min(1, Math.max(0, (t - (1500 + tile.c * 22)) / 240));
        const alpha = appear * (1 - gone);
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = tile.color;
        const s = size * (0.6 + 0.4 * appear);
        const off = (size - s) / 2;
        ctx.fillRect(tile.c * size + off, tile.r * size + off, s + 0.5, s + 0.5);
      }
      ctx.globalAlpha = 1;
      if (t < DURATION) raf = requestAnimationFrame(frame);
      else finish();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      onClick={finish}
      aria-hidden
      className={`fixed inset-0 z-50 bg-paper transition-opacity duration-200 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <p
        className="animate-fade absolute inset-0 flex items-center justify-center text-6xl font-extrabold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.4)]"
        style={{ animationDelay: "500ms" }}
      >
        Brandr
      </p>
    </div>
  );
}
