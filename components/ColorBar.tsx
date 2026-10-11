import { RegMark } from "./RegMark";
import type { Round, RoundResult } from "@/lib/types";

/**
 * The printer's color bar, between registration targets: one chip per round.
 * A correct answer inks the chip with the brand's real primary color; a miss
 * leaves it grey with a red notch. Doubles as the session's at-a-glance
 * scoreboard and the spine of the share card.
 */
export function ColorBar({
  rounds,
  results,
  currentIndex,
  tall = false,
}: {
  rounds: Round[];
  results: RoundResult[];
  currentIndex?: number;
  tall?: boolean;
}) {
  return (
    <div
      className="color-bar text-ink flex w-full items-center gap-2"
      aria-hidden
    >
      <RegMark className={tall ? "h-4 w-4" : "h-3 w-3"} />
      <div
        className={`color-bar-chips flex flex-1 gap-[3px] ${tall ? "h-9" : "h-2.5"}`}
      >
        {rounds.map((round, i) => {
          const result = results[i];
          const shape = `color-bar-chip relative flex-1 ${tall ? "rounded-md" : "rounded-[3px]"}`;
          if (result?.correct) {
            return (
              <div
                key={i}
                className={`${shape} animate-ink origin-bottom`}
                style={{
                  backgroundColor: round.brand.colors[0].hex,
                  animationDelay: tall ? `${300 + i * 70}ms` : undefined,
                }}
              />
            );
          }
          if (result) {
            return (
              <div key={i} className={`${shape} bg-rule overflow-hidden`}>
                <span className="color-bar-notch bg-flag absolute inset-x-0 bottom-0 h-[3px]" />
              </div>
            );
          }
          return (
            <div
              key={i}
              className={`${shape} ${
                i === currentIndex
                  ? "color-bar-current animate-cursor border-ink bg-card border"
                  : "bg-rule"
              }`}
            />
          );
        })}
      </div>
      <RegMark className={tall ? "h-4 w-4" : "h-3 w-3"} />
    </div>
  );
}
