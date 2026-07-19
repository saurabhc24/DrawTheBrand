"use client";

import { useEffect, useState } from "react";
import { fakeStyle } from "@/lib/fake";
import type { RoundResult } from "@/lib/types";

function HexChip({ hex, name }: { hex: string; name?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(hex).then(() => setCopied(true));
      }}
      className="hex-chip pressable border-rule bg-card w-24 shrink-0 overflow-hidden rounded-xl border text-left"
      aria-label={`Copy ${hex}`}
    >
      <span
        className="hex-chip-color block h-14 w-full"
        style={{ backgroundColor: hex }}
      />
      <span className="hex-chip-meta block px-2 py-1.5">
        <span className="hex-chip-value block font-mono text-[11px] font-medium">
          {copied ? "Copied" : hex.toUpperCase()}
        </span>
        {name && (
          <span className="hex-chip-name text-ink-muted block truncate text-[10px]">
            {name}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * The shared post-round screen (PRD §7): verdict, real logo, tappable hex
 * chips, fun fact, Next. Shown after every round in every mode.
 */
export function RevealScreen({
  result,
  isLast,
  onNext,
}: {
  result: RoundResult;
  isLast: boolean;
  onNext: () => void;
}) {
  const { brand, correct, skipped, mode, picked, score } = result;
  const verdict =
    mode === "draw" && score != null
      ? `${score}/100`
      : result.timedOut
        ? "Time's up"
        : correct
          ? "Correct"
          : skipped
            ? "Skipped"
            : "Not quite";

  return (
    // No min-h-0 here: the column must keep its natural height so the shell's
    // scroll area takes over on short screens instead of crushing the content.
    <div className="reveal-screen animate-rise flex flex-1 flex-col">
      <div className="verdict-row flex shrink-0 items-center gap-3">
        <span
          className={`verdict-pill animate-stamp inline-block rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-white uppercase ${
            correct ? "bg-proof" : "bg-flag"
          }`}
        >
          {verdict}
        </span>
        <h2 className="reveal-brand-name text-2xl font-extrabold tracking-tight">
          {brand.name}
        </h2>
      </div>

      {mode === "fake" && result.shownFake ? (
        <>
          <div className="fake-compare mt-4 grid shrink-0 grid-cols-2 gap-3">
            <figure className="fake-shown-card border-flag bg-card overflow-hidden rounded-2xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.logoFull}
                alt="The doctored logo you were shown"
                className="aspect-square w-full"
                style={fakeStyle(result.shownFake)}
              />
              <figcaption className="border-flag text-flag border-t px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                What you saw
              </figcaption>
            </figure>
            <figure className="fake-real-card border-rule bg-card overflow-hidden rounded-2xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.logoFull}
                alt={`The real ${brand.name} logo`}
                className="aspect-square w-full"
              />
              <figcaption className="border-rule text-ink-muted border-t px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                The real one
              </figcaption>
            </figure>
          </div>
          <p className="whats-wrong border-flag text-ink mt-3 shrink-0 border-l-2 pl-3 text-sm leading-relaxed">
            {result.shownFake.whatsWrong}
          </p>
        </>
      ) : mode === "draw" && result.drawing ? (
        <div className="draw-compare mt-4 grid shrink-0 grid-cols-2 gap-3">
          <figure className="draw-yours-card border-rule bg-card overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.drawing}
              alt="Your drawing"
              className="aspect-square w-full"
            />
            <figcaption className="border-rule text-ink-muted border-t px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase">
              Yours
            </figcaption>
          </figure>
          <figure className="draw-actual-card border-rule bg-card overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.assets.logoFull}
              alt={`${brand.name} logo`}
              className="aspect-square w-full"
            />
            <figcaption className="border-rule text-ink-muted border-t px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase">
              Actual
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="reveal-logo-card border-rule bg-card mx-auto mt-4 w-full max-w-80 shrink-0 overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.assets.logoFull}
            alt={`${brand.name} logo`}
            className="aspect-square w-full"
          />
        </div>
      )}

      {mode === "shade" && picked && !correct && !skipped && (
        <div className="shade-compare mt-4 flex shrink-0 items-center gap-3">
          {[
            { hex: picked, label: "You picked" },
            { hex: brand.colors[0].hex, label: "The real one" },
          ].map(({ hex, label }) => (
            <div
              key={label}
              className="shade-compare-item flex items-center gap-2"
            >
              <span
                className="shade-compare-swatch border-rule h-6 w-6 rounded-sm border"
                style={{ backgroundColor: hex }}
              />
              <span className="shade-compare-label text-ink-muted font-mono text-[11px]">
                {label} {hex.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="hex-chips-heading text-ink-muted mt-4 shrink-0 text-[11px] font-bold tracking-[0.2em] uppercase">
        The exact colors — tap to copy
      </p>
      <div className="hex-chips mt-2 flex shrink-0 gap-2 overflow-x-auto pb-1">
        {brand.colors.map((c) => (
          <HexChip key={c.hex} hex={c.hex} name={c.name} />
        ))}
      </div>

      <p className="fun-fact border-rule text-ink-muted mt-4 line-clamp-3 border-l-2 pl-3 text-sm leading-relaxed">
        {brand.funFact}
      </p>

      <div className="next-row mt-auto shrink-0 pt-4">
        <button
          onClick={onNext}
          className="next-button pressable bg-ink text-paper w-full rounded-full py-4 text-base font-bold"
        >
          {isLast ? "See results" : "Next"}
        </button>
      </div>
    </div>
  );
}
