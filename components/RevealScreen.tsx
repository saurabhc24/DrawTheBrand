"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "./Icons";
import { DRAW_PASS_SCORE } from "@/lib/drawScore";
import { fakeStyle } from "@/lib/fake";
import { useHotkeys } from "@/lib/useHotkeys";
import type { RoundResult } from "@/lib/types";

/** A Pantone-style chip: color block over a white spec label. Tap to copy. */
function SpecChip({ hex, name }: { hex: string; name?: string }) {
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
      className="spec-chip pressable bg-card w-[6.5rem] shrink-0 overflow-hidden rounded-lg text-left shadow-[0_0_0_1px_var(--color-rule)]"
      aria-label={`Copy ${hex}`}
    >
      <span
        className="spec-chip-color block h-14 w-full"
        style={{ backgroundColor: hex }}
      />
      <span className="spec-chip-meta block px-2 pt-1.5 pb-2">
        <span className="spec-chip-name block truncate text-[10.5px] font-extrabold tracking-tight uppercase">
          {name ?? "Brand color"}
        </span>
        <span className="spec-chip-value text-ink-muted block font-mono text-[11px]">
          {copied ? "Copied ✓" : hex.toUpperCase()}
        </span>
      </span>
    </button>
  );
}

/** A captioned figure, used for the side-by-side comparisons. */
function Figure({
  src,
  alt,
  caption,
  tone = "neutral",
  style,
  stage = false,
}: {
  src: string;
  alt: string;
  caption: string;
  tone?: "neutral" | "flag";
  style?: React.CSSProperties;
  stage?: boolean;
}) {
  const edge =
    tone === "flag" ? "border-flag text-flag" : "border-rule text-ink-muted";
  return (
    <figure
      className={`compare-figure bg-card overflow-hidden rounded-2xl border ${edge} ${stage ? "vt-stage" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-square w-full" style={style} />
      <figcaption
        className={`compare-caption border-t px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase ${edge}`}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * The shared post-round screen (PRD §7): stamped verdict, the real mark as a
 * proof, tappable spec chips, fun fact, Next. Enter / Space / → continues.
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
  useHotkeys({ enter: onNext, " ": onNext, arrowright: onNext });

  const verdict =
    mode === "draw" && score != null
      ? `${score}/100`
      : mode === "focus" && correct && score != null
        ? `+${score} pts`
        : result.timedOut
          ? "Time's up"
          : correct
            ? "Correct"
            : skipped
              ? "Skipped"
              : "Not quite";
  const [region, sector] = brand.category.split("-");

  return (
    // No min-h-0 here: the column must keep its natural height so the shell's
    // scroll area takes over on short screens instead of crushing the content.
    <div className="reveal-screen flex flex-1 flex-col">
      <div className="verdict-row flex shrink-0 items-start justify-between gap-3">
        <div className="reveal-title min-w-0">
          <h2 className="reveal-brand-name animate-rise text-[28px] leading-none font-black tracking-[-0.03em] font-stretch-semi-expanded">
            {brand.name}
          </h2>
          <p className="reveal-meta text-ink-muted mt-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase">
            {region} · {sector}
          </p>
        </div>
        <span
          className={`verdict-stamp stamp ink-texture animate-stamp mt-0.5 mr-1 shrink-0 px-2.5 py-1 font-mono text-[13px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase ${
            correct ? "text-proof" : "text-flag"
          }`}
          style={{ animationDelay: "120ms" }}
        >
          {verdict}
        </span>
      </div>

      {mode === "fake" && result.shownFake ? (
        <>
          <div className="fake-compare mt-4 grid shrink-0 grid-cols-2 gap-3">
            <Figure
              src={brand.assets.logoFull}
              alt="The doctored logo you were shown"
              caption="What you saw"
              tone="flag"
              style={fakeStyle(result.shownFake)}
              stage
            />
            <Figure
              src={brand.assets.logoFull}
              alt={`The real ${brand.name} logo`}
              caption="The real one"
            />
          </div>
          <p className="whats-wrong border-flag text-ink mt-3 shrink-0 border-l-2 pl-3 text-sm leading-relaxed">
            {result.shownFake.whatsWrong}
          </p>
        </>
      ) : mode === "draw" && result.drawing ? (
        <>
          <div className="draw-compare mt-4 grid shrink-0 grid-cols-2 gap-3">
            <Figure src={result.drawing} alt="Your drawing" caption="Yours" />
            <Figure
              src={brand.assets.logoFull}
              alt={`${brand.name} logo`}
              caption="Actual"
              stage
            />
          </div>
          {score != null && (
            <div className="score-meter mt-4 shrink-0">
              <div className="score-meter-legend text-ink-muted flex justify-between font-mono text-[10px] tracking-[0.12em] uppercase">
                <span>Similarity</span>
                <span>Pass at {DRAW_PASS_SCORE}</span>
              </div>
              <div className="score-meter-track bg-rule relative mt-1.5 h-2.5 rounded-full">
                <div
                  className={`score-meter-fill animate-meter h-full origin-left rounded-full ${correct ? "bg-proof" : "bg-flag"}`}
                  style={{ width: `${score}%` }}
                />
                <span
                  className="score-meter-pass bg-ink absolute -top-1 -bottom-1 w-0.5 rounded-full"
                  style={{ left: `${DRAW_PASS_SCORE}%` }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="reveal-proof crop-marks mx-auto mt-3 w-full max-w-[min(16rem,30dvh)] shrink-0">
          <div className="reveal-logo-card vt-stage border-rule bg-card overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.assets.logoFull}
              alt={`${brand.name} logo`}
              className="aspect-square w-full"
            />
          </div>
        </div>
      )}

      {mode === "shade" && picked && !correct && !skipped && (
        <div className="shade-compare mt-3 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {[
            { hex: picked, label: "You picked" },
            { hex: brand.colors[0].hex, label: "Real" },
          ].map(({ hex, label }) => (
            <div
              key={label}
              className="shade-compare-item flex items-center gap-2"
            >
              <span
                className="shade-compare-swatch border-rule h-5 w-5 rounded-full border"
                style={{ backgroundColor: hex }}
              />
              <span className="shade-compare-label text-ink-muted font-mono text-[11px]">
                {label} {hex.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="spec-heading text-ink-muted mt-4 flex shrink-0 items-baseline justify-between font-mono text-[10.5px] tracking-[0.12em] uppercase">
        <span>Brand spec</span>
        <span>Tap to copy</span>
      </div>
      <div className="spec-chips -mx-4 mt-2 flex shrink-0 gap-2 overflow-x-auto px-4 pt-px pb-1">
        {brand.colors.map((c) => (
          <SpecChip key={c.hex} hex={c.hex} name={c.name} />
        ))}
      </div>

      <figure className="fun-fact mt-4 flex shrink-0 gap-3">
        <span
          aria-hidden
          className="fun-fact-mark text-ink/15 -mt-1 text-4xl leading-none font-black"
        >
          &ldquo;
        </span>
        <p className="fun-fact-text text-ink-muted line-clamp-3 text-sm leading-relaxed">
          {brand.funFact}
        </p>
      </figure>

      {/* Pinned: on short phones the reveal scrolls under the action. */}
      <div className="next-row bg-paper before:from-paper sticky bottom-0 mt-auto shrink-0 pt-4 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:to-transparent">
        <button
          onClick={onNext}
          className="next-button pressable bg-ink text-paper flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
        >
          {isLast ? "See results" : "Next"}
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}
