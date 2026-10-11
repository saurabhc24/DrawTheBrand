"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ColorBar } from "./ColorBar";
import { ReplayIcon, ShareIcon } from "./Icons";
import { MODE_META } from "./RoundShell";
import { renderShareCard } from "@/lib/shareCard";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { PlayableMode, Round, RoundResult } from "@/lib/types";

/** Agency job titles by accuracy — the shareable hook. */
const TIERS = [
  {
    min: 1,
    title: "Creative Director",
    quip: "Not a single shade out of place.",
    ink: "#1E4633",
  },
  {
    min: 0.8,
    title: "Art Director",
    quip: "A sharp eye. One or two slipped past.",
    ink: "#1E4633",
  },
  {
    min: 0.6,
    title: "Senior Designer",
    quip: "Solid recall. The details are where it bites.",
    ink: "#1E4633",
  },
  {
    min: 0.4,
    title: "Junior Designer",
    quip: "You know the brands. The specifics, less so.",
    ink: "#C2551A",
  },
  {
    min: 0.2,
    title: "Design Intern",
    quip: "Recognizing is easy. Remembering is hard.",
    ink: "#E0442A",
  },
  {
    min: 0,
    title: "Focus Group",
    quip: "You've seen these ten thousand times. Again?",
    ink: "#E0442A",
  },
];

const MODE_NAMES: Record<PlayableMode | "mixed", string> = {
  mixed: "Mixed",
  colors: "Palette",
  shade: "Exact shade",
  fake: "Real or fake",
  draw: "Draw",
  focus: "Focus",
};

/** Ease a number up from zero; instant for reduced-motion users. */
function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/** End-of-session recap: a press proof of the run, stamped with a rank. */
export function Results({
  mode,
  rounds,
  results,
  bestStreak,
  onReplay,
}: {
  mode: PlayableMode | "mixed";
  rounds: Round[];
  results: RoundResult[];
  bestStreak: number;
  onReplay: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const tier = TIERS.find((t) => correct / Math.max(1, total) >= t.min)!;
  // Focus sessions bank points for early calls; they replace accuracy, which
  // only repeats the score.
  const points =
    mode === "focus"
      ? results.reduce((sum, r) => sum + (r.score ?? 0), 0)
      : null;
  const label =
    points == null ? MODE_NAMES[mode] : `${MODE_NAMES[mode]} · ${points} pts`;
  const shown = useCountUp(correct);
  const [card, setCard] = useState<File | null>(null);
  const [shareNote, setShareNote] = useState("");

  // Render the share card up front: the share sheet must open inside the tap
  // (Safari drops the user gesture across slow async work).
  useEffect(() => {
    renderShareCard({ results, ...tier, label })
      .then((blob) =>
        setCard(new File([blob], "brandr-result.png", { type: "image/png" })),
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const share = async () => {
    const grid = results
      .map((r) => (r.correct ? "🟩" : r.skipped || r.timedOut ? "⬜" : "🟥"))
      .join("");
    const text = `${SITE_NAME} ${MODE_NAMES[mode]} ${correct}/${total}${points == null ? "" : ` · ${points} pts`} — ${tier.title}\n${grid}\n${SITE_URL}`;
    try {
      if (card && navigator.canShare?.({ files: [card] })) {
        await navigator.share({ files: [card], text });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // sheet dismissed
    }
    // Desktop fallback: save the card, copy the text.
    if (card) {
      const url = URL.createObjectURL(card);
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: card.name,
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    await navigator.clipboard?.writeText(text).catch(() => {});
    setShareNote(card ? "Card saved · text copied" : "Result copied");
  };

  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="results-screen app-sheet mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-5 pb-4">
      <header className="results-header text-ink-muted flex shrink-0 items-center justify-between font-mono text-[11px] tracking-[0.14em] uppercase">
        <span>Results</span>
        <span>
          {MODE_NAMES[mode]} · {total} rounds
        </span>
      </header>

      <div className="results-scroll -mx-4 mt-2 min-h-0 flex-1 overflow-y-auto px-4">
        <section className="proof-sheet crop-marks animate-rise">
          <div className="proof-sheet-card bg-card relative overflow-hidden rounded-3xl p-5 shadow-[0_0_0_1px_var(--color-rule)]">
            <div className="proof-sheet-slug text-ink-muted flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase">
              <span className="text-ink font-sans text-[15px] font-black tracking-[-0.03em] normal-case font-stretch-expanded">
                Brandr
              </span>
              <span>Proof · {date}</span>
            </div>
            <div className="proof-score mt-3 flex items-baseline gap-1">
              <span className="proof-score-value text-[104px] leading-[0.85] font-black tracking-[-0.05em] font-stretch-expanded tabular-nums">
                {shown}
              </span>
              <span className="proof-score-total text-ink-muted text-3xl font-bold font-stretch-expanded">
                /{total}
              </span>
            </div>
            <span
              className="rank-stamp stamp ink-texture animate-stamp mt-4 ml-1 px-3 py-1.5 font-mono text-[13px] font-semibold tracking-[0.18em] uppercase [--tilt:-4deg]"
              style={{ color: tier.ink, animationDelay: "650ms" }}
            >
              {tier.title}
            </span>
            <p className="proof-quip text-ink-muted mt-4 text-[15px] leading-snug">
              {tier.quip}
            </p>
            <div className="proof-colorbar mt-4">
              <ColorBar rounds={rounds} results={results} tall />
            </div>
          </div>
        </section>

        <div className="results-bento mt-1 grid grid-cols-2 gap-3">
          <div className="streak-card bg-block-orange flex min-h-24 flex-col justify-between rounded-3xl p-4 text-white">
            <span className="streak-card-label font-mono text-[10px] tracking-[0.16em] uppercase opacity-75">
              Best streak
            </span>
            <span className="streak-card-value self-end text-4xl font-black font-stretch-expanded">
              {bestStreak}
            </span>
          </div>
          <div className="accuracy-card bg-block-pink text-ink flex min-h-24 flex-col justify-between rounded-3xl p-4">
            <span className="accuracy-card-label font-mono text-[10px] tracking-[0.16em] uppercase opacity-60">
              {points == null ? "Accuracy" : "Points"}
            </span>
            <span className="accuracy-card-value self-end text-4xl font-black font-stretch-expanded">
              {points == null ? `${accuracy}%` : points}
            </span>
          </div>
        </div>

        <ol className="recap-list divide-rule border-rule bg-card mt-3 divide-y rounded-3xl border px-4">
          {results.map((r, i) => (
            <li key={i} className="recap-row flex items-center gap-3 py-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.brand.assets.logoFull}
                alt=""
                className={`recap-logo border-rule h-10 w-10 shrink-0 rounded-lg border ${r.correct ? "" : "opacity-40 grayscale"}`}
              />
              <span className="recap-text min-w-0 flex-1">
                <span className="recap-brand block truncate text-sm font-bold">
                  {r.brand.name}
                </span>
                <span className="recap-mode text-ink-muted flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${MODE_META[r.mode].dot}`}
                  />
                  {MODE_META[r.mode].label}
                </span>
              </span>
              <span
                className={`recap-outcome font-mono text-[11px] font-semibold tracking-[0.12em] uppercase ${
                  r.correct ? "text-proof" : "text-flag"
                }`}
              >
                {r.mode === "draw" && r.score != null
                  ? `${r.score}/100`
                  : r.mode === "focus" && r.correct && r.score != null
                    ? `+${r.score} pts`
                    : r.correct
                      ? "Got it"
                      : r.timedOut
                        ? "Time"
                        : r.skipped
                          ? "Skip"
                          : "Miss"}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="results-actions grid shrink-0 grid-cols-2 gap-2.5 pt-3">
        <button
          onClick={onReplay}
          className="replay-button pressable bg-ink text-paper flex items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold"
        >
          <ReplayIcon />
          Play again
        </button>
        <button
          onClick={share}
          className="share-button pressable bg-block-yellow text-ink flex items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold"
        >
          <ShareIcon />
          Share
        </button>
      </div>
      <div className="results-footer text-ink-muted mt-2.5 flex shrink-0 items-center justify-between font-mono text-[10.5px] tracking-[0.12em] uppercase">
        <Link
          href="/"
          className="home-link hover:text-ink underline underline-offset-4"
        >
          Change mode
        </Link>
        <span className="share-note" aria-live="polite">
          {shareNote}
        </span>
      </div>
    </div>
  );
}
