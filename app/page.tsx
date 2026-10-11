import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { Intro } from "@/components/Intro";
import { ModeArt } from "@/components/ModeArt";
import { RegMark } from "@/components/RegMark";
import { hexToHsl } from "@/lib/color";
import { brands } from "@/lib/data";
import { DEFAULT_ROUNDS } from "@/lib/session";

const MODES = [
  {
    id: "mixed",
    tag: `Mix · ${DEFAULT_ROUNDS} rounds`,
    name: "Mixed",
    blurb: "All four tests, shuffled. The full exam.",
    card: "bg-ink text-paper",
    wide: true,
  },
  {
    id: "colors",
    tag: "Mode A",
    name: "Palette",
    blurb: "Name the brand from its colors alone.",
    card: "bg-block-orange text-white",
  },
  {
    id: "shade",
    tag: "Mode B",
    name: "Exact shade",
    blurb: "Only one swatch is the real hex.",
    card: "bg-block-pink text-ink",
  },
  {
    id: "fake",
    tag: "Mode C",
    name: "Real or fake",
    blurb: "Half of these logos are doctored.",
    card: "bg-block-yellow text-ink",
  },
  {
    id: "draw",
    tag: "Mode D",
    name: "Draw",
    blurb: "Sketch it from memory. Get scored.",
    card: "bg-block-green text-paper",
  },
];

/** Spectrum order: hues first (reds wrap to the front), then neutrals light → dark. */
function spectrumKey(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return s < 0.12 ? 1000 - l : (h + 20) % 360;
}
const SPECTRUM = [...brands].sort(
  (a, b) => spectrumKey(a.colors[0].hex) - spectrumKey(b.colors[0].hex),
);
// An even sample of the roster, so the strip reads as a spectrum of real
// brand colors at any dataset size. The intro pours its tiles into these chips.
const STRIP_COUNT = 22;
const STRIP = Array.from(
  { length: STRIP_COUNT },
  (_, i) => SPECTRUM[Math.floor(((i + 0.5) * SPECTRUM.length) / STRIP_COUNT)],
);

// Runs before first paint: hides the static page while the once-per-session
// intro is pending, so it never flashes. Mirrors the checks in Intro.tsx.
const INTRO_GATE = `try{if(!sessionStorage.getItem("brandr:introSeen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!/[?&]nointro/.test(location.search))document.documentElement.classList.add("intro")}catch(e){}`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <Intro />
      <div className="home-screen app-sheet mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-6 pb-4">
        <header className="home-header shrink-0">
          <div className="home-ticket text-ink-muted flex items-center justify-between font-mono text-[10.5px] tracking-[0.14em] uppercase">
            <span>A brand memory test</span>
            <span>{brands.length} brands · 4 tests</span>
          </div>
          <h1 className="home-title mt-3 text-[64px] leading-[0.9] font-black tracking-[-0.045em] font-stretch-expanded">
            Brandr
          </h1>
          {/* Calibration strip: the roster's real primary colors, in spectrum order. */}
          <div
            className="calibration-strip text-ink mt-4 flex items-center gap-2"
            aria-hidden
          >
            <RegMark className="h-3.5 w-3.5" />
            <div className="calibration-chips flex h-3 flex-1 gap-[3px]">
              {STRIP.map((b, i) => (
                <span
                  key={b.id}
                  data-color={b.colors[0].hex}
                  className="calibration-chip animate-chip-wave flex-1 rounded-full"
                  style={{
                    backgroundColor: b.colors[0].hex,
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              ))}
            </div>
            <RegMark className="h-3.5 w-3.5" />
          </div>
          <p className="home-tagline text-ink-muted mt-4 text-[15px] leading-relaxed [@media(max-height:760px)]:hidden">
            You&apos;ve seen these logos ten thousand times. This measures what
            actually stuck.
          </p>
        </header>

        {/* Rows share the spare height but never shrink below their content
            (1fr = minmax(auto, 1fr)); short phones scroll the grid instead. */}
        <section
          className="mode-grid mt-5 grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(auto,0.8fr)_1fr_1fr] gap-3 overflow-y-auto"
          aria-label="Pick a mode"
        >
          {MODES.map((m, i) => (
            <Link
              key={m.id}
              href={`/play?mode=${m.id}`}
              className={`mode-card pressable animate-rise flex flex-col rounded-[28px] p-4 ${m.card} ${
                m.wide ? "col-span-2" : ""
              }`}
              style={{ animationDelay: `${60 + i * 70}ms` }}
            >
              <span className="mode-card-head flex items-start justify-between gap-2">
                <span className="mode-card-tag font-mono text-[10px] tracking-[0.16em] uppercase opacity-70">
                  {m.tag}
                </span>
                {m.wide ? (
                  <span className="mode-card-go bg-paper text-ink grid h-8 w-8 place-items-center rounded-full">
                    <ArrowIcon />
                  </span>
                ) : (
                  <ModeArt mode={m.id} />
                )}
              </span>
              {m.wide && <ModeArt mode="mixed" />}
              <span className="mode-card-body mt-auto block">
                <span className="mode-card-name block text-[22px] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
                  {m.name}
                </span>
                <span className="mode-card-blurb mt-1 block text-[13px] leading-snug opacity-75">
                  {m.blurb}
                </span>
              </span>
            </Link>
          ))}
        </section>

        <footer className="home-footer border-rule text-ink-muted mt-4 flex shrink-0 items-end justify-between gap-6 border-t pt-3 text-[11px] leading-relaxed">
          <p className="legal-note">
            A memory game, not an affiliation. All marks belong to their owners.{" "}
            <a
              href="mailto:hellosaurabhchandra@gmail.com?subject=Brandr%20takedown%20request"
              className="underline underline-offset-2"
            >
              Takedown requests
            </a>
            .
          </p>
          <p className="maker-credit shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase">
            Made by{" "}
            <a
              href="https://hellosaurabhchandra.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink font-semibold underline underline-offset-2"
            >
              Saurabh
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
