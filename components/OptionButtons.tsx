import type { Brand } from "@/lib/types";

const INDEX_LABELS = ["A", "B", "C", "D"];

/** Shared 4-option grid for the guess modes. Big, thumb-friendly targets. */
export function OptionButtons({
  options,
  onPick,
}: {
  options: Brand[];
  onPick: (brandId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((brand, i) => (
        <button
          key={brand.id}
          onClick={() => onPick(brand.id)}
          className="pressable relative min-h-16 rounded-md border border-rule bg-card px-3 py-4 text-center text-base font-semibold hover:border-ink-muted"
        >
          <span
            aria-hidden
            className="absolute top-1.5 left-2 font-mono text-[10px] text-ink-muted"
          >
            {INDEX_LABELS[i]}
          </span>
          {brand.name}
        </button>
      ))}
    </div>
  );
}
