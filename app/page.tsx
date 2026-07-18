"use client";

import Link from "next/link";
import { useState } from "react";
import { brands } from "@/lib/data";
import type { Pack } from "@/lib/types";

const PACKS: { id: Pack; label: string }[] = [
  { id: "all", label: "All brands" },
  { id: "indian", label: "Indian" },
  { id: "global", label: "Global" },
];

const MODES = [
  {
    id: "mixed",
    tag: "Mix",
    name: "Mixed",
    blurb: "All three challenges, shuffled. The full test.",
    primary: true,
  },
  {
    id: "colors",
    tag: "Mode A",
    name: "Palette",
    blurb: "Name the brand from its colors alone — no shapes, no letters.",
  },
  {
    id: "shade",
    tag: "Mode B",
    name: "Exact shade",
    blurb: "Four near-identical swatches. Only one is the real hex.",
  },
  {
    id: "crop",
    tag: "Mode C",
    name: "Close-up",
    blurb: "Call the brand from one zoomed-in sliver of its logo.",
  },
];

export default function Home() {
  const [pack, setPack] = useState<Pack>("all");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-14">
      <header>
        <p className="font-mono text-[11px] tracking-[0.3em] text-ink-muted uppercase">
          A brand memory test
        </p>
        <h1 className="mt-2 text-6xl font-extrabold tracking-tight">Brandr</h1>
        {/* Calibration strip: every brand in the current pack, by its real primary color. */}
        <div className="mt-4 flex h-2 gap-[3px]" aria-hidden>
          {brands
            .filter((b) => pack === "all" || b.region === pack)
            .map((b) => (
              <span
                key={b.id}
                className="flex-1 rounded-[2px]"
                style={{ backgroundColor: b.colors[0].hex }}
              />
            ))}
        </div>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          You&apos;ve seen these logos ten thousand times. This measures what actually stuck.
        </p>
      </header>

      <section className="mt-8" aria-label="Pick a pack">
        <div className="flex gap-2">
          {PACKS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPack(p.id)}
              className={`pressable rounded-full border px-4 py-2 text-sm font-semibold ${
                pack === p.id
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-card text-ink hover:border-ink-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-3" aria-label="Pick a mode">
        {MODES.map((m) => (
          <Link
            key={m.id}
            href={`/play?mode=${m.id}&pack=${pack}`}
            className={`pressable rounded-lg border p-4 ${
              m.primary
                ? "border-ink bg-ink text-paper"
                : "border-rule bg-card hover:border-ink-muted"
            }`}
          >
            <span
              className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                m.primary ? "text-paper/60" : "text-ink-muted"
              }`}
            >
              {m.tag}
            </span>
            <span className="mt-1 block text-lg font-extrabold tracking-tight">{m.name}</span>
            <span className={`mt-0.5 block text-sm ${m.primary ? "text-paper/70" : "text-ink-muted"}`}>
              {m.blurb}
            </span>
          </Link>
        ))}
      </section>

      <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase">
        In the works: wordmark · real or fake · draw from memory
      </p>

      <footer className="mt-auto pt-10 text-xs leading-relaxed text-ink-muted">
        A memory game, not an affiliation. All marks belong to their owners and appear here to
        test how well we remember them. Something yours shown wrongly?{" "}
        <a href="mailto:takedown@example.com" className="underline underline-offset-2">
          Ask us to take it down.
        </a>
      </footer>
    </div>
  );
}
