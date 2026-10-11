"use client";

import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/rng";

const SEEN_KEY = "brandr:introSeen"; // the gate script in app/page.tsx checks it too
const WORD_SCALE = 1.2;

// Timeline (ms): tiles pop in → sort into a spectrum → pour into the strip.
const SORT_AT = 620;
const LAND_AT = 1450;
const END = 2300;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const backOut = (t: number) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

/**
 * Once-per-session intro, choreographed into the home page: a mosaic of the
 * roster's real colors pops in, sorts itself into a spectrum, then pours into
 * the calibration strip while the wordmark flies onto the title (FLIP). Every
 * piece lands exactly on its live counterpart, so the hand-off has no seam.
 * Plain canvas — no WebGL payload for two seconds of splash. Skipped for
 * reduced motion; a tap or any key cuts it short.
 */
export function Intro() {
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wordRef = useRef<HTMLParagraphElement | null>(null);
  const skipRef = useRef(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      new URLSearchParams(location.search).has("nointro") ||
      sessionStorage.getItem(SEEN_KEY)
    ) {
      html.classList.remove("intro");
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");
    html.classList.add("intro");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    const overlay = overlayRef.current!;
    const canvas = canvasRef.current!;
    const word = wordRef.current!;
    const title = document.querySelector<HTMLElement>(".home-title");
    const chips = [
      ...document.querySelectorAll<HTMLElement>(".calibration-chip"),
    ];

    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      html.classList.remove("intro", "intro-landing");
      overlay.style.transition = "opacity 180ms ease";
      overlay.style.opacity = "0";
      setTimeout(() => setVisible(false), 200);
    };
    skipRef.current = finish;
    if (!title || chips.length === 0) return finish();
    window.addEventListener("keydown", finish, { once: true });

    // The flying wordmark copies the live title's type exactly.
    const type = getComputedStyle(title);
    Object.assign(word.style, {
      fontFamily: type.fontFamily,
      fontSize: type.fontSize,
      fontWeight: type.fontWeight,
      fontStretch: type.fontStretch,
      letterSpacing: type.letterSpacing,
      lineHeight: type.lineHeight,
    });

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return finish();
    ctx.scale(dpr, dpr);

    // Every tile belongs to one strip chip. Start slots are random; end slots
    // run column-major in strip order, so the mosaic resolves into the
    // strip's own spectrum fanned across the screen.
    const cols = Math.max(8, Math.round(w / 52));
    const size = w / cols;
    const rows = Math.ceil(h / size);
    const n = cols * rows;
    const colors = chips.map((c) => c.dataset.color ?? "#131313");
    const starts = shuffle([...Array(n).keys()], Math.random);
    const tiles = starts.map((slot, k) => ({
      chip: Math.min(chips.length - 1, Math.floor((k * chips.length) / n)),
      sx: (slot % cols) * size,
      sy: Math.floor(slot / cols) * size,
      ex: Math.floor(k / rows) * size,
      ey: (k % rows) * size,
      pop: Math.random() * 380,
      sort: Math.random() * 160,
      fly: Math.random() * 220,
    }));
    let targets: DOMRect[] = [];

    // Hand-off: the page fades up behind the tiles, the tiles pour into the
    // real chips, and the wordmark flies onto the real title.
    const land = () => {
      targets = chips.map((c) => c.getBoundingClientRect());
      html.classList.replace("intro", "intro-landing");
      overlay.style.backgroundColor = "transparent";

      const from = word.getBoundingClientRect();
      const to = title.getBoundingClientRect();
      Object.assign(word.style, {
        transition: "none",
        left: `${to.left}px`,
        top: `${to.top}px`,
        transformOrigin: "0 0",
        transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${WORD_SCALE})`,
      });
      word.getBoundingClientRect(); // commit the inverted frame before playing
      Object.assign(word.style, {
        transition:
          "transform 780ms cubic-bezier(.7,0,.2,1), color 420ms ease 240ms, text-shadow 420ms ease",
        transform: "none",
        color: "var(--color-ink)",
        textShadow: "none",
      });
    };

    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;
      if (t >= LAND_AT && targets.length === 0) land();
      ctx.clearRect(0, 0, w, h);
      for (const tile of tiles) {
        ctx.fillStyle = colors[tile.chip];
        if (t < LAND_AT) {
          const s = size * Math.max(0, backOut(clamp01((t - tile.pop) / 280)));
          const q = inOut(clamp01((t - SORT_AT - tile.sort) / 620));
          const inset = (size - s) / 2;
          ctx.fillRect(
            lerp(tile.sx, tile.ex, q) + inset,
            lerp(tile.sy, tile.ey, q) + inset,
            s + 0.5,
            s + 0.5,
          );
        } else {
          const r = targets[tile.chip];
          const q = inOut(clamp01((t - LAND_AT - tile.fly) / 600));
          ctx.beginPath();
          ctx.roundRect(
            lerp(tile.ex, r.left, q),
            lerp(tile.ey, r.top, q),
            lerp(size + 0.5, r.width, q),
            lerp(size + 0.5, r.height, q),
            lerp(0, r.height / 2, q),
          );
          ctx.fill();
        }
      }
      if (t < END) raf = requestAnimationFrame(frame);
      else finish();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      ref={overlayRef}
      onClick={() => skipRef.current()}
      aria-hidden
      className="intro-overlay bg-paper fixed inset-0 z-50 transition-[background-color] duration-500"
    >
      <canvas ref={canvasRef} className="intro-canvas h-full w-full" />
      <p
        ref={wordRef}
        className="intro-wordmark animate-fade absolute m-0 whitespace-nowrap text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)]"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${WORD_SCALE})`,
          animationDelay: "420ms",
        }}
      >
        Brandr
      </p>
    </div>
  );
}
