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
    <div className="shade-round animate-fade flex flex-1 flex-col">
      <h1 className="round-question text-xl font-extrabold tracking-tight">
        Which one is the real {colorName}?
      </h1>
      <div className="shade-logo-card border-rule bg-card mx-auto mt-4 w-40 shrink-0 overflow-hidden rounded-2xl border">
        {/* Drained of color on purpose: the shade must come from memory. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={round.brand.assets.logoFull}
          alt={`${round.brand.name} logo in black and white`}
          className="aspect-square w-full grayscale"
        />
      </div>
      <p className="shade-hint text-ink-muted mt-3 text-center text-sm">
        No peeking — the logo&apos;s been drained. Pick the shade from memory.
      </p>
      <div className="swatch-grid mt-auto grid shrink-0 grid-cols-2 gap-3 pt-6">
        {round.swatches!.map((hex, i) => (
          <button
            key={i}
            onClick={() => onPick(hex)}
            aria-label={`Swatch ${i + 1}`}
            className="swatch-button pressable border-rule h-24 rounded-2xl border"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  );
}
