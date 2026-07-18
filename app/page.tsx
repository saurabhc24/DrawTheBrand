import Link from "next/link";
import { Intro } from "@/components/Intro";
import { brands } from "@/lib/data";

const MODES = [
  {
    id: "mixed",
    tag: "Mix",
    name: "Mixed",
    blurb: "All four challenges, shuffled. The full test.",
    card: "bg-ink text-paper",
    tagColor: "text-paper/60",
    blurbColor: "text-paper/70",
    wide: true,
  },
  {
    id: "colors",
    tag: "Mode A",
    name: "Palette",
    blurb: "Name the brand from its colors alone.",
    card: "bg-block-orange text-white",
    tagColor: "text-white/70",
    blurbColor: "text-white/85",
  },
  {
    id: "shade",
    tag: "Mode B",
    name: "Exact shade",
    blurb: "Only one swatch is the real hex.",
    card: "bg-block-pink text-ink",
    tagColor: "text-ink/60",
    blurbColor: "text-ink/70",
  },
  {
    id: "fake",
    tag: "Mode C",
    name: "Real or fake",
    blurb: "Half of these logos are doctored.",
    card: "bg-block-yellow text-ink",
    tagColor: "text-ink/60",
    blurbColor: "text-ink/70",
  },
  {
    id: "draw",
    tag: "Mode D",
    name: "Draw",
    blurb: "Sketch it from memory. Get scored.",
    card: "bg-block-green text-paper",
    tagColor: "text-paper/60",
    blurbColor: "text-paper/75",
  },
];

// A steady sample keeps the calibration strip chunky at any dataset size.
const STRIP_STEP = Math.max(1, Math.ceil(brands.length / 22));
const STRIP = brands.filter((_, i) => i % STRIP_STEP === 0);

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-8 sm:pt-10">
      <Intro />
      <header>
        <p className="text-[11px] font-bold tracking-[0.25em] text-ink-muted uppercase">
          A brand memory test
        </p>
        <h1 className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">Brandr</h1>
        {/* Calibration strip: a sample of the roster, by real primary color. */}
        <div className="mt-4 flex h-2.5 gap-[3px]" aria-hidden>
          {STRIP.map((b) => (
            <span
              key={b.id}
              className="flex-1 rounded-full"
              style={{ backgroundColor: b.colors[0].hex }}
            />
          ))}
        </div>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          You&apos;ve seen these logos ten thousand times. This measures what actually stuck.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3" aria-label="Pick a mode">
        {MODES.map((m) => (
          <Link
            key={m.id}
            href={`/play?mode=${m.id}`}
            className={`pressable flex min-h-36 flex-col justify-between rounded-3xl p-4 ${m.card} ${
              m.wide ? "col-span-2 min-h-28" : ""
            }`}
          >
            <span className={`text-[10px] font-bold tracking-[0.22em] uppercase ${m.tagColor}`}>
              {m.tag}
            </span>
            <span>
              <span className="block text-xl leading-tight font-extrabold tracking-tight">
                {m.name}
              </span>
              <span className={`mt-1 block text-[13px] leading-snug ${m.blurbColor}`}>
                {m.blurb}
              </span>
            </span>
          </Link>
        ))}
      </section>

      <p className="mt-5 text-[11px] font-bold tracking-[0.18em] text-ink-muted uppercase">
        In the works: wordmark · close-up
      </p>

      <footer className="mt-auto pt-8 text-xs leading-relaxed text-ink-muted">
        <p>
          A memory game, not an affiliation. All marks belong to their owners and appear here to
          test how well we remember them. Something yours shown wrongly?{" "}
          <a href="mailto:takedown@example.com" className="underline underline-offset-2">
            Ask us to take it down.
          </a>
        </p>
        <p className="mt-3 font-semibold text-ink">
          Made by{" "}
          <a
            href="https://github.com/saurabhc24"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Saurabh
          </a>
        </p>
      </footer>
    </div>
  );
}
