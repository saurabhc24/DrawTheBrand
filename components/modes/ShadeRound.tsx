import { CheckIcon, CrossIcon } from "../Icons";
import { choiceKeys, useHotkeys } from "@/lib/useHotkeys";
import type { Round, RoundResult } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Mode B: the real logo drained to grey, four near-identical swatches as
 * Pantone-style chips, one true hex. The chips' labels stay masked until the
 * answer lands.
 */
export function ShadeRound({
  round,
  answered,
  onPick,
}: {
  round: Round;
  answered?: RoundResult;
  onPick: (hex: string) => void;
}) {
  const colorName = round.brand.colors[0].name ?? `${round.brand.name}'s color`;
  const trueHex = round.brand.colors[0].hex.toUpperCase();
  const swatches = round.swatches!;
  useHotkeys(choiceKeys(swatches, onPick), !answered);

  return (
    <div className="shade-round animate-fade flex flex-1 flex-col">
      <h1 className="round-question text-[22px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        Which one is the real {colorName}?
      </h1>
      <p className="round-hint text-ink-muted mt-1 font-mono text-[10.5px] tracking-[0.12em] uppercase">
        The logo&apos;s been drained · pick from memory
      </p>
      <div className="shade-stage [container-type:size] flex min-h-40 flex-1 items-center justify-center py-2">
        <div className="shade-proof crop-marks w-[min(100cqw,100cqh,15rem)]">
          <div className="shade-logo-card vt-stage border-rule bg-card overflow-hidden rounded-xl border">
            {/* Drained of color on purpose: the shade must come from memory. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={round.brand.assets.logoFull}
              alt={`${round.brand.name} logo in black and white`}
              className="aspect-square w-full grayscale"
            />
          </div>
        </div>
      </div>
      <div className="swatch-grid grid shrink-0 grid-cols-2 gap-3 pt-2">
        {swatches.map((hex, i) => {
          const isTrue = hex === trueHex;
          const isPick = answered?.picked === hex;
          const state = !answered
            ? "border-rule"
            : isTrue
              ? "border-proof ring-proof ring-2"
              : isPick
                ? "border-flag ring-flag animate-shake ring-2"
                : "border-rule opacity-35";
          return (
            <button
              key={i}
              onClick={() => onPick(hex)}
              disabled={!!answered}
              aria-label={`Swatch ${LETTERS[i]}`}
              className={`swatch-chip pressable bg-card flex flex-col overflow-hidden rounded-2xl border text-left ${state}`}
            >
              <span
                className="swatch-chip-color block h-[clamp(3.5rem,11dvh,6rem)] w-full"
                style={{ backgroundColor: hex }}
              />
              <span className="swatch-chip-label flex items-center justify-between gap-2 px-3 py-2 font-mono text-[11px]">
                <span className="swatch-chip-key font-semibold">
                  {LETTERS[i]}
                </span>
                <span
                  className={`swatch-chip-hex flex items-center gap-1 ${
                    answered && (isTrue || isPick)
                      ? isTrue
                        ? "text-proof font-semibold"
                        : "text-flag font-semibold"
                      : "text-ink-muted"
                  }`}
                >
                  {answered && isTrue && <CheckIcon className="h-3 w-3" />}
                  {answered && isPick && !isTrue && (
                    <CrossIcon className="h-3 w-3" />
                  )}
                  {answered ? hex : "#??????"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
