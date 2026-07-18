import { OptionButtons } from "../OptionButtons";
import type { Round } from "@/lib/types";

/** Mode A: the brand's palette as proportional blocks — no shape, no text. */
export function ColorsRound({
  round,
  onPick,
}: {
  round: Round;
  onPick: (brandId: string) => void;
}) {
  const colors = round.brand.colors;
  const total = colors.reduce((sum, c) => sum + (c.proportion ?? 1 / colors.length), 0);

  return (
    <div className="animate-fade flex flex-1 flex-col">
      <h1 className="text-xl font-extrabold tracking-tight">Whose palette is this?</h1>
      <div
        className="mt-4 flex h-64 w-full flex-col overflow-hidden rounded-lg border border-rule"
        role="img"
        aria-label="A brand's colors, shown in proportion"
      >
        {colors.map((c, i) => (
          <div
            key={i}
            style={{
              backgroundColor: c.hex,
              flexGrow: (c.proportion ?? 1 / colors.length) / total,
            }}
          />
        ))}
      </div>
      <div className="mt-auto pt-6">
        <OptionButtons options={round.options!} onPick={onPick} />
      </div>
    </div>
  );
}
