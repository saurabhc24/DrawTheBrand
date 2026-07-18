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
          className="pressable relative min-h-16 rounded-2xl bg-tile px-3 py-4 text-center text-base font-bold hover:bg-rule"
        >
          <span
            aria-hidden
            className="absolute top-2 left-3 text-[10px] font-bold text-ink-muted"
          >
            {INDEX_LABELS[i]}
          </span>
          {brand.name}
        </button>
      ))}
    </div>
  );
}
