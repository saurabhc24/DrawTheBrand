import { OptionButtons } from "../OptionButtons";
import { inkOn } from "@/lib/color";
import type { Round, RoundResult } from "@/lib/types";

/** Mode A: the brand's palette as proportional blocks — no shape, no text. */
export function ColorsRound({
  round,
  answered,
  onPick,
}: {
  round: Round;
  answered?: RoundResult;
  onPick: (brandId: string) => void;
}) {
  const colors = round.brand.colors;
  const shares = colors.map((c) => c.proportion ?? 1 / colors.length);
  const total = shares.reduce((sum, s) => sum + s, 0);

  return (
    <div className="colors-round animate-fade flex flex-1 flex-col">
      <h1 className="round-question text-[22px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        Whose palette is this?
      </h1>
      <p className="round-hint text-ink-muted mt-1 font-mono text-[10.5px] tracking-[0.12em] uppercase">
        Colors in proportion · no shapes, no text
      </p>
      {/* A color proof: bands at their share of the logo, annotated like a spec. */}
      <div className="palette-proof crop-marks mt-2 flex min-h-48 flex-1 flex-col">
        <div
          className="palette-stack vt-stage border-rule flex flex-1 flex-col overflow-hidden rounded-2xl border"
          role="img"
          aria-label="A brand's colors, shown in proportion"
        >
          {colors.map((c, i) => (
            <div
              key={i}
              className="palette-band relative"
              style={{ backgroundColor: c.hex, flexGrow: shares[i] / total }}
            >
              {shares[i] / total >= 0.12 && (
                <span
                  className="palette-band-label absolute top-2.5 left-3 font-mono text-[10px] tracking-[0.12em] opacity-60"
                  style={{ color: inkOn(c.hex) }}
                >
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  {Math.round((shares[i] / total) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="round-actions shrink-0 pt-3">
        <OptionButtons
          options={round.options!}
          answerId={round.brand.id}
          answered={answered}
          onPick={onPick}
        />
      </div>
    </div>
  );
}
