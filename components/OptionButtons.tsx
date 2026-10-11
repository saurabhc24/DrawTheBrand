import { CheckIcon, CrossIcon } from "./Icons";
import { choiceKeys, useHotkeys } from "@/lib/useHotkeys";
import type { Brand, RoundResult } from "@/lib/types";

const INDEX_LABELS = ["A", "B", "C", "D"];

/**
 * Shared 4-option grid for the guess modes. Big, thumb-friendly targets;
 * 1–4 / A–D on a keyboard. Once answered it shows the verdict in place: your
 * pick in green or red, the right answer ringed if you missed it.
 */
export function OptionButtons({
  options,
  answerId,
  answered,
  onPick,
}: {
  options: Brand[];
  answerId: string;
  answered?: RoundResult;
  onPick: (brandId: string) => void;
}) {
  useHotkeys(
    choiceKeys(options, (b) => onPick(b.id)),
    !answered,
  );

  return (
    <div className="option-grid grid shrink-0 grid-cols-2 gap-3">
      {options.map((brand, i) => {
        const isAnswer = brand.id === answerId;
        const isPick = answered?.picked === brand.id;
        const state = !answered
          ? "bg-tile hover:bg-rule"
          : isAnswer && isPick
            ? "bg-proof text-white"
            : isAnswer
              ? "bg-tile ring-proof ring-2 ring-inset"
              : isPick
                ? "bg-flag animate-shake text-white"
                : "bg-tile opacity-35";
        return (
          <button
            key={brand.id}
            onClick={() => onPick(brand.id)}
            disabled={!!answered}
            className={`option-button pressable relative flex min-h-16 items-center justify-center gap-1.5 rounded-2xl px-3 py-4 text-center text-base font-bold ${state}`}
          >
            <span
              aria-hidden
              className="option-key absolute top-2 left-2.5 font-mono text-[10px] font-semibold opacity-50"
            >
              {INDEX_LABELS[i]}
            </span>
            {answered && isAnswer && <CheckIcon />}
            {answered && isPick && !isAnswer && <CrossIcon />}
            {brand.name}
          </button>
        );
      })}
    </div>
  );
}
