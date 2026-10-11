"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "next/navigation";
import { RoundShell } from "@/components/RoundShell";
import { RevealScreen } from "@/components/RevealScreen";
import { Results } from "@/components/Results";
import { ColorsRound } from "@/components/modes/ColorsRound";
import { ShadeRound } from "@/components/modes/ShadeRound";
import { FakeRound } from "@/components/modes/FakeRound";
import { DrawRound } from "@/components/modes/DrawRound";
import { FocusRound, focusPoints } from "@/components/modes/FocusRound";
import { DRAW_PASS_SCORE } from "@/lib/drawScore";
import { buildSession } from "@/lib/session";
import type {
  Pack,
  PlayableMode,
  Round,
  RoundResult,
  Session,
} from "@/lib/types";

const VALID_MODES = ["colors", "shade", "fake", "draw", "focus", "mixed"];
const VALID_PACKS = ["all", "indian", "global"];

/**
 * Round clock per mode. Guess modes are snap decisions; drawing needs longer;
 * focus outlasts its 6 s pull, so a sharp logo can still be called.
 */
const TIMER_SECONDS: Record<PlayableMode, number> = {
  colors: 5,
  shade: 5,
  fake: 5,
  draw: 30,
  focus: 8,
};

/** How long right/wrong shows on the question itself before the reveal. */
const FEEDBACK_MS = 750;

type Phase = "question" | "feedback" | "reveal" | "done";

/** Haptics where the platform has them (Android); a silent no-op elsewhere. */
const buzz = (pattern: number | number[]) => navigator.vibrate?.(pattern);

/** Morph between screens with the View Transitions API where supported. */
function transition(update: () => void) {
  if (!document.startViewTransition) return update();
  document.startViewTransition(() => flushSync(update));
}

export function PlayClient() {
  const params = useSearchParams();
  const mode = (
    VALID_MODES.includes(params.get("mode") ?? "")
      ? params.get("mode")
      : "mixed"
  ) as PlayableMode | "mixed";
  const pack = (
    VALID_PACKS.includes(params.get("pack") ?? "") ? params.get("pack") : "all"
  ) as Pack;

  // Built on the client only, so the seeded randomness never fights hydration.
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timerFrac, setTimerFrac] = useState(1);
  // Expiry is keyed to the round object, not a boolean: a flag left over from
  // a timed-out round can never forfeit the next one (or a replayed session).
  const [expired, setExpired] = useState<Round | null>(null);

  useEffect(() => {
    setSession(buildSession(mode, pack));
  }, [mode, pack]);

  const round = session?.rounds[index];
  const timeUp = round != null && expired === round;

  // The round clock: ticks only while a question is open; it freezes (rather
  // than vanishes) through the feedback beat. Haptic ticks for the last 2 s.
  useEffect(() => {
    if (!round || phase !== "question") return;
    setTimerFrac(1);
    const total = TIMER_SECONDS[round.mode] * 1000;
    const deadline = Date.now() + total;
    let lastSecond = TIMER_SECONDS[round.mode];
    const tick = setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        clearInterval(tick);
        setTimerFrac(0);
        setExpired(round);
        return;
      }
      setTimerFrac(left / total);
      const second = Math.ceil(left / 1000);
      if (second !== lastSecond && second <= 2) buzz(8);
      lastSecond = second;
    }, 100);
    return () => clearInterval(tick);
  }, [round, phase]);

  // Clock expiry for the tap modes: the answer flashes up in context, then
  // the reveal. Draw handles its own via the timeUp prop (it scores whatever
  // is on the canvas instead of forfeiting).
  useEffect(() => {
    if (!timeUp || phase !== "question" || !round || round.mode === "draw")
      return;
    setResults((prev) => [
      ...prev,
      {
        brand: round.brand,
        mode: round.mode,
        correct: false,
        skipped: false,
        timedOut: true,
        ...(round.mode === "fake" ? { shownFake: round.fake ?? null } : {}),
      },
    ]);
    buzz([24, 60, 24]);
    setPhase("feedback");
  }, [timeUp, phase, round]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(
      () => transition(() => setPhase("reveal")),
      FEEDBACK_MS,
    );
    return () => clearTimeout(t);
  }, [phase]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = results.length - 1; i >= 0 && results[i].correct; i--) n++;
    return n;
  }, [results]);

  const bestStreak = useMemo(() => {
    let best = 0;
    let run = 0;
    for (const r of results) {
      run = r.correct ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  }, [results]);

  // In-session best streak only (PRD v1: sessionStorage, no cross-device state).
  useEffect(() => {
    if (bestStreak === 0) return;
    const prev = Number(sessionStorage.getItem("brandr:bestStreak") ?? 0);
    if (bestStreak > prev)
      sessionStorage.setItem("brandr:bestStreak", String(bestStreak));
  }, [bestStreak]);

  if (!session) return null;
  const rounds = session.rounds;

  if (!round) {
    return (
      <div className="empty-state app-sheet mx-auto flex h-dvh max-w-md flex-col items-center justify-center overflow-hidden px-4 text-center">
        <p className="empty-state-note text-ink-muted text-sm">
          This pack doesn&apos;t have enough brands for that mode yet.
        </p>
      </div>
    );
  }

  /** Record the round's outcome, with a haptic verdict. */
  const settle = (outcome: Omit<RoundResult, "brand" | "mode">) => {
    setResults((prev) => [
      ...prev,
      { brand: round.brand, mode: round.mode, ...outcome },
    ]);
    buzz(outcome.correct ? 14 : [24, 60, 24]);
  };

  const answer = (picked: string, correct: boolean, score?: number) => {
    settle({ correct, skipped: false, picked, score });
    setPhase("feedback");
  };

  const submitFakeCall = (saidFake: boolean) => {
    settle({
      correct: saidFake === (round.fake != null),
      skipped: false,
      picked: saidFake ? "fake" : "real",
      shownFake: round.fake ?? null,
    });
    setPhase("feedback");
  };

  const submitDrawing = (drawing: string, score: number) =>
    transition(() => {
      settle({
        correct: score >= DRAW_PASS_SCORE,
        skipped: false,
        drawing,
        score,
      });
      setPhase("reveal");
    });

  const skip = () =>
    transition(() => {
      setResults((prev) => [
        ...prev,
        { brand: round.brand, mode: round.mode, correct: false, skipped: true },
      ]);
      setPhase("reveal");
    });

  const next = () =>
    transition(() => {
      if (index + 1 >= rounds.length) {
        setPhase("done");
      } else {
        setIndex(index + 1);
        setPhase("question");
      }
    });

  const replay = () =>
    transition(() => {
      setSession(buildSession(mode, pack));
      setIndex(0);
      setResults([]);
      setPhase("question");
    });

  if (phase === "done") {
    return (
      <Results
        mode={mode}
        rounds={rounds}
        results={results}
        bestStreak={bestStreak}
        onReplay={replay}
      />
    );
  }

  const answered = phase === "feedback" ? results.at(-1) : undefined;

  return (
    <RoundShell
      rounds={rounds}
      results={results}
      index={index}
      streak={streak}
      onSkip={skip}
      showSkip={phase === "question"}
      timer={
        phase === "question" || phase === "feedback"
          ? {
              frac: timerFrac,
              seconds: Math.ceil(timerFrac * TIMER_SECONDS[round.mode]),
            }
          : undefined
      }
    >
      {phase === "reveal" ? (
        <RevealScreen
          result={results[results.length - 1]}
          isLast={index + 1 >= rounds.length}
          onNext={next}
        />
      ) : round.mode === "colors" ? (
        <ColorsRound
          round={round}
          answered={answered}
          onPick={(id) => answer(id, id === round.brand.id)}
        />
      ) : round.mode === "shade" ? (
        <ShadeRound
          round={round}
          answered={answered}
          onPick={(hex) =>
            answer(hex, hex === round.brand.colors[0].hex.toUpperCase())
          }
        />
      ) : round.mode === "focus" ? (
        <FocusRound
          round={round}
          answered={answered}
          onPick={(id, elapsedMs) => {
            const correct = id === round.brand.id;
            answer(id, correct, correct ? focusPoints(elapsedMs) : 0);
          }}
        />
      ) : round.mode === "draw" ? (
        <DrawRound
          round={round}
          onDone={submitDrawing}
          onSkip={skip}
          timeUp={timeUp}
        />
      ) : (
        <FakeRound round={round} answered={answered} onPick={submitFakeCall} />
      )}
    </RoundShell>
  );
}
