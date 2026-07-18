import type { Round } from "@/lib/types";

/** Mode B: the real logo, four near-identical swatches, one true hex. */
export function ShadeRound({
  round,
  onPick,
}: {
  round: Round;
  onPick: (hex: string) => void;
}) {
  const colorName = round.brand.colors[0].name ?? `${round.brand.name}'s color`;

  return (
    <div className="animate-fade flex flex-1 flex-col">
      <h1 className="text-xl font-extrabold tracking-tight">
        Which one is the real {colorName}?
      </h1>
      <div className="mx-auto mt-4 w-40 overflow-hidden rounded-2xl border border-rule bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={round.brand.assets.logoFull}
          alt={`${round.brand.name} logo`}
          className="aspect-square w-full"
        />
      </div>
      <p className="mt-3 text-center text-sm text-ink-muted">
        Three of these are impostors, nudged just a little.
      </p>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        {round.swatches!.map((hex, i) => (
          <button
            key={i}
            onClick={() => onPick(hex)}
            aria-label={`Swatch ${i + 1}`}
            className="pressable h-24 rounded-2xl border border-rule"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  );
}
