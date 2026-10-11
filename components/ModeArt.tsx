import { brands } from "@/lib/data";

/** Four near-identical magentas: the shade-mode problem in miniature. */
const SHADES = ["#C2185B", "#CC2468", "#B71456", "#C91E62"];
/** A four-point sparkle: a stand-in logo for the focus art. */
const SPARKLE =
  "M16 2C17 11 21 15 30 16C21 17 17 21 16 30C15 21 11 17 2 16C11 15 15 11 16 2Z";
/** A swoosh-ish scribble, in the 64×48 px box the draw art renders at 1:1. */
const SCRIBBLE = "M6 34 C 15 44, 33 38, 58 9 C 43 27, 27 35, 17 31";
const TICKER = brands.filter((_, i) => i % 3 === 0);

/**
 * Tiny looping illustrations of each mode's mechanic, drawn in the card's own
 * ink so the chrome stays flat. Pure CSS motion; every piece's resting style
 * is a sensible still, which is what reduced-motion users see.
 */
export function ModeArt({ mode }: { mode: string }) {
  switch (mode) {
    case "mixed":
      // A ticker of the roster, each name keyed by its real primary color.
      return (
        <span
          className="mixed-art -mx-4 my-auto flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] py-2"
          aria-hidden
        >
          <span className="mixed-art-track animate-marquee flex shrink-0 items-center gap-5 pr-5 font-mono text-[11px] tracking-[0.12em] whitespace-nowrap uppercase">
            {[...TICKER, ...TICKER].map((b, i) => (
              <span key={i} className="mixed-art-item flex items-center gap-2">
                <span
                  className="mixed-art-dot h-2.5 w-2.5 rounded-full shadow-[0_0_0_1px_rgb(255_255_255/0.25)]"
                  style={{ backgroundColor: b.colors[0].hex }}
                />
                {b.name}
              </span>
            ))}
          </span>
        </span>
      );
    case "colors":
      // Proportional bands that keep re-dividing the swatch.
      return (
        <span
          className="palette-art flex h-16 w-12 flex-col gap-[3px]"
          aria-hidden
        >
          <span className="palette-art-band grow basis-0 animate-[band-a_4.5s_ease-in-out_infinite] rounded-[4px] bg-white" />
          <span className="palette-art-band grow basis-0 animate-[band-b_4.5s_ease-in-out_infinite] rounded-[4px] bg-white/60" />
          <span className="palette-art-band grow basis-0 animate-[band-c_4.5s_ease-in-out_infinite] rounded-[4px] bg-white/30" />
        </span>
      );
    case "shade":
      // A selection ring scanning four swatches that are almost the same.
      return (
        <span className="shade-art grid grid-cols-2 gap-1.5" aria-hidden>
          {SHADES.map((c, i) => (
            <span
              key={c}
              className="shade-art-chip h-6 w-6 animate-[swatch-pick_4s_ease-in-out_infinite] rounded-md"
              style={{ backgroundColor: c, animationDelay: `${i}s` }}
            />
          ))}
        </span>
      );
    case "fake":
      // A mark that gets quietly squeezed — and the label that calls it.
      return (
        <span className="fake-art flex flex-col items-center gap-1" aria-hidden>
          <svg
            viewBox="0 0 48 32"
            className="fake-art-mark h-9 w-14 animate-[squash_3.6s_ease-in-out_infinite]"
          >
            <circle cx="17" cy="16" r="12.5" fill="currentColor" />
            <circle
              cx="31"
              cy="16"
              r="12.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <span className="fake-art-label relative h-3 w-10 font-mono text-[9px] leading-3 font-semibold tracking-[0.16em] uppercase">
            <span className="fake-art-real absolute inset-0 animate-[label-real_3.6s_ease-in-out_infinite] text-center">
              Real
            </span>
            <span className="fake-art-fake text-flag absolute inset-0 animate-[label-fake_3.6s_ease-in-out_infinite] text-center opacity-0">
              Fake
            </span>
          </span>
        </span>
      );
    case "draw":
      // A stroke drawing itself, pen tip riding the path.
      return (
        <span className="draw-art relative block h-12 w-16" aria-hidden>
          <svg
            viewBox="0 0 64 48"
            fill="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d={SCRIBBLE}
              pathLength={1}
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              className="draw-art-stroke animate-[draw-path_3.6s_ease-in-out_infinite]"
            />
          </svg>
          <span
            className="draw-art-pen bg-block-yellow absolute top-0 left-0 h-2.5 w-2.5 animate-[pen_3.6s_ease-in-out_infinite] rounded-full shadow-[0_0_0_2px_var(--color-block-green)]"
            style={{ offsetPath: `path("${SCRIBBLE}")`, offsetRotate: "0deg" }}
          />
        </span>
      );
    case "focus":
      // An autofocus box hunting, then locking on as the mark sharpens.
      return (
        <span
          className="focus-art relative grid h-16 w-16 place-items-center"
          aria-hidden
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="focus-art-brackets absolute inset-0 h-full w-full animate-[af-lock_3.6s_ease-in-out_infinite]"
          >
            <path d="M4 18V4h14M46 4h14v14M60 46v14H46M18 60H4V46" />
          </svg>
          <svg
            viewBox="0 0 32 32"
            className="focus-art-mark h-8 w-8 animate-[focus-blur_3.6s_ease-in-out_infinite]"
          >
            <path d={SPARKLE} fill="currentColor" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}
