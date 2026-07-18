import type { Round, RoundResult } from "@/lib/types";

/**
 * The printer's color bar: one chip per round. A correct answer fills the chip
 * with the brand's real primary color; a wrong one leaves it grey with a red
 * notch. Doubles as the session's at-a-glance scoreboard (and, later, the
 * share card).
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
    <div className={`flex w-full gap-[3px] ${tall ? "h-8" : "h-2.5"}`} aria-hidden>
      {rounds.map((round, i) => {
        const result = results[i];
        let cls = "bg-rule";
        let style: React.CSSProperties | undefined;
        if (result) {
          if (result.correct) {
            style = { backgroundColor: round.brand.colors[0].hex };
            cls = "";
          } else {
            cls = "bg-rule border-b-2 border-flag";
          }
        } else if (i === currentIndex) {
          cls = "bg-card border border-ink";
        }
        return <div key={i} className={`flex-1 rounded-[2px] ${cls}`} style={style} />;
      })}
    </div>
  );
}
