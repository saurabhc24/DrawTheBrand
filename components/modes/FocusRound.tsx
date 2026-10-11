"use client";

import { useEffect, useRef } from "react";
import { OptionButtons } from "../OptionButtons";
import type { Round, RoundResult } from "@/lib/types";

/** The logo pulls into focus over this long; a correct call's points track how early it came. */
export const SHARPEN_MS = 6000;
// Also the first-paint style, so the sharp logo never flashes before the pull starts.
const START_BLUR = "blur(24px)";

/** 100 points at the first frame, sliding to a floor of 10 once the logo is sharp. */
export function focusPoints(elapsedMs: number) {
  return Math.max(10, Math.round(100 * (1 - elapsedMs / SHARPEN_MS)));
}

/**
 * Focus mode: the real logo starts heavily blurred and pulls into focus — call the
 * brand before it sharpens. The distractors share its dominant color
 * (lib/session.ts), so the call has to come from shape, not a color blob.
 */
export function FocusRound({
  round,
  answered,
  onPick,
}: {
  round: Round;
  answered?: RoundResult;
  onPick: (brandId: string, elapsedMs: number) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const pullRef = useRef<Animation | null>(null);

  // The pull runs on the Web Animations API, so its clock is exactly what the
  // player saw. It waits for the logo to load: a slow network never costs points.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const start = () => {
      pullRef.current = img.animate(
        [{ filter: START_BLUR }, { filter: "blur(0px)" }],
        {
          duration: SHARPEN_MS,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // ease-out: detail arrives gradually
          fill: "forwards",
        },
      );
    };
    if (img.complete) start();
    else img.addEventListener("load", start, { once: true });
    return () => {
      img.removeEventListener("load", start);
      pullRef.current?.cancel();
    };
  }, []);

  // Answered (or out of time): snap the rest of the way into focus.
  useEffect(() => {
    if (answered) pullRef.current?.updatePlaybackRate(12);
  }, [answered]);

  // A tap before the logo has even loaded is a blind guess: floor points.
  const pick = (brandId: string) => {
    const t = pullRef.current?.currentTime;
    onPick(brandId, typeof t === "number" ? t : SHARPEN_MS);
  };

  return (
    <div className="focus-round animate-fade flex flex-1 flex-col">
      <h1 className="round-question text-[22px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        Whose logo is this?
      </h1>
      <p className="round-hint text-ink-muted mt-1 font-mono text-[10.5px] tracking-[0.12em] uppercase">
        Pulling into focus · call it early, score more
      </p>
      <div className="focus-stage [container-type:size] flex min-h-48 flex-1 items-center justify-center py-2">
        <div className="focus-proof crop-marks relative w-[min(100cqw,100cqh,20rem)]">
          <div className="focus-logo-card vt-stage border-rule bg-card overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={round.brand.assets.logoFull}
              alt="A logo pulling into focus"
              className="aspect-square w-full"
              style={{ filter: START_BLUR }}
            />
          </div>
          {answered?.correct && answered.score != null && (
            <span className="focus-points stamp bg-card text-proof animate-stamp absolute top-6 right-6 px-2.5 py-1 font-mono text-sm font-semibold [--tilt:-6deg]">
              +{answered.score}
            </span>
          )}
        </div>
      </div>
      <div className="round-actions shrink-0 pt-2">
        <OptionButtons
          options={round.options!}
          answerId={round.brand.id}
          answered={answered}
          onPick={pick}
        />
      </div>
    </div>
  );
}
