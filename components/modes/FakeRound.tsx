import { CheckIcon, CrossIcon } from "../Icons";
import { fakeStyle } from "@/lib/fake";
import { useHotkeys } from "@/lib/useHotkeys";
import type { Round, RoundResult } from "@/lib/types";

/**
 * Mode E: one logo, one binary call — is this the true mark or a doctored one?
 * The distortion (if any) was fixed when the session was built. R / F on a
 * keyboard.
 */
export function FakeRound({
  round,
  answered,
  onPick,
}: {
  round: Round;
  answered?: RoundResult;
  onPick: (saidFake: boolean) => void;
}) {
  useHotkeys(
    {
      r: () => onPick(false),
      f: () => onPick(true),
      arrowleft: () => onPick(false),
      arrowright: () => onPick(true),
    },
    !answered,
  );

  const calls = [
    { said: "real", label: "Real", key: "R", fill: "bg-proof" },
    { said: "fake", label: "Fake", key: "F", fill: "bg-flag" },
  ];

  return (
    <div className="fake-round animate-fade flex flex-1 flex-col">
      <h1 className="round-question text-[22px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        Is this the real {round.brand.name} logo?
      </h1>
      <p className="round-hint text-ink-muted mt-1 font-mono text-[10.5px] tracking-[0.12em] uppercase">
        Look twice · half of these are doctored
      </p>
      <div className="fake-stage [container-type:size] flex min-h-56 flex-1 items-center justify-center py-2">
        <div className="suspect-proof crop-marks w-[min(100cqw,100cqh,24rem)]">
          <div className="suspect-logo-card vt-stage border-rule bg-card overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={round.brand.assets.logoFull}
              alt={`A logo that may or may not be the real ${round.brand.name} mark`}
              className="aspect-square w-full"
              style={fakeStyle(round.fake)}
            />
          </div>
        </div>
      </div>
      <div className="verdict-buttons grid shrink-0 grid-cols-2 gap-3 pt-2">
        {calls.map((c) => {
          const isTruth = c.said === (round.fake ? "fake" : "real");
          const isPick = answered?.picked === c.said;
          // Lit after answering: your call, or the truth if the clock ran out.
          const lit = answered && (isPick || (answered.timedOut && isTruth));
          return (
            <button
              key={c.said}
              onClick={() => onPick(c.said === "fake")}
              disabled={!!answered}
              className={`${c.said}-button pressable relative flex min-h-16 items-center justify-center gap-2 rounded-2xl py-4 font-mono text-sm font-semibold tracking-[0.18em] text-white uppercase ${c.fill} ${
                answered && !lit ? "opacity-30" : ""
              } ${lit && !isTruth ? "animate-shake" : ""}`}
            >
              {lit && (isTruth ? <CheckIcon /> : <CrossIcon />)}
              {c.label}
              <span
                aria-hidden
                className="verdict-key absolute top-2 right-3 text-[10px] opacity-50"
              >
                {c.key}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
