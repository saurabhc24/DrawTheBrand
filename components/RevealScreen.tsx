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
      className="pressable w-24 shrink-0 overflow-hidden rounded-xl border border-rule bg-card text-left"
      aria-label={`Copy ${hex}`}
    >
      <span className="block h-14 w-full" style={{ backgroundColor: hex }} />
      <span className="block px-2 py-1.5">
        <span className="block font-mono text-[11px] font-medium">
          {copied ? "Copied" : hex.toUpperCase()}
        </span>
        {name && <span className="block truncate text-[10px] text-ink-muted">{name}</span>}
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
    <div className="animate-rise flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3">
        <span
          className={`animate-stamp inline-block rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-white uppercase ${
            correct ? "bg-proof" : "bg-flag"
          }`}
        >
          {verdict}
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight">{brand.name}</h2>
      </div>

      {mode === "fake" && result.shownFake ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <figure className="overflow-hidden rounded-2xl border border-flag bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.logoFull}
                alt="The doctored logo you were shown"
                className="aspect-square w-full"
                style={fakeStyle(result.shownFake)}
              />
              <figcaption className="border-t border-flag px-2 py-1.5 text-[10px] font-bold tracking-widest text-flag uppercase">
                What you saw
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-rule bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.logoFull}
                alt={`The real ${brand.name} logo`}
                className="aspect-square w-full"
              />
              <figcaption className="border-t border-rule px-2 py-1.5 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
                The real one
              </figcaption>
            </figure>
          </div>
          <p className="mt-3 border-l-2 border-flag pl-3 text-sm leading-relaxed text-ink">
            {result.shownFake.whatsWrong}
          </p>
        </>
      ) : mode === "draw" && result.drawing ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <figure className="overflow-hidden rounded-2xl border border-rule bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.drawing} alt="Your drawing" className="aspect-square w-full" />
            <figcaption className="border-t border-rule px-2 py-1.5 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
              Yours
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-rule bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.assets.logoFull} alt={`${brand.name} logo`} className="aspect-square w-full" />
            <figcaption className="border-t border-rule px-2 py-1.5 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
              Actual
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="mt-4 mx-auto w-full max-w-80 overflow-hidden rounded-2xl border border-rule bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.assets.logoFull} alt={`${brand.name} logo`} className="aspect-square w-full" />
        </div>
      )}

      {mode === "shade" && picked && !correct && !skipped && (
        <div className="mt-4 flex items-center gap-3">
          {[
            { hex: picked, label: "You picked" },
            { hex: brand.colors[0].hex, label: "The real one" },
          ].map(({ hex, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="h-6 w-6 rounded-sm border border-rule"
                style={{ backgroundColor: hex }}
              />
              <span className="font-mono text-[11px] text-ink-muted">
                {label} {hex.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] font-bold tracking-[0.2em] text-ink-muted uppercase">
        The exact colors — tap to copy
      </p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {brand.colors.map((c) => (
          <HexChip key={c.hex} hex={c.hex} name={c.name} />
        ))}
      </div>

      <p className="mt-4 line-clamp-3 border-l-2 border-rule pl-3 text-sm leading-relaxed text-ink-muted">
        {brand.funFact}
      </p>

      <div className="mt-auto pt-4">
        <button
          onClick={onNext}
          className="pressable w-full rounded-full bg-ink py-4 text-base font-bold text-paper"
        >
          {isLast ? "See results" : "Next"}
        </button>
      </div>
    </div>
  );
}
