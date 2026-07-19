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
    <div className="home-screen mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-8 pb-4 sm:pt-10">
      <Intro />
      <header className="home-header shrink-0">
        <p className="home-eyebrow text-ink-muted text-[11px] font-bold tracking-[0.25em] uppercase">
          A brand memory test
        </p>
        <h1 className="home-title mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">
          Brandr
        </h1>
        {/* Calibration strip: a sample of the roster, by real primary color. */}
        <div
          className="calibration-strip mt-4 flex h-2.5 gap-[3px]"
          aria-hidden
        >
          {STRIP.map((b, i) => (
            <span
              key={b.id}
              className="calibration-chip animate-chip-wave flex-1 rounded-full"
              style={{
                backgroundColor: b.colors[0].hex,
                animationDelay: `${i * 110}ms`,
              }}
            />
          ))}
        </div>
        <p className="home-tagline text-ink-muted mt-4 text-base leading-relaxed">
          You&apos;ve seen these logos ten thousand times. This measures what
          actually stuck.
        </p>
      </header>

      <section
        className="mode-grid mt-5 grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto"
        aria-label="Pick a mode"
      >
        {MODES.map((m) => (
          <Link
            key={m.id}
            href={`/play?mode=${m.id}`}
            className={`mode-card pressable flex min-h-32 flex-col justify-between rounded-3xl p-4 ${m.card} ${
              m.wide ? "col-span-2 min-h-24" : ""
            }`}
          >
            <span
              className={`mode-card-tag text-[10px] font-bold tracking-[0.22em] uppercase ${m.tagColor}`}
            >
              {m.tag}
            </span>
            <span className="mode-card-body">
              <span className="mode-card-name block text-xl leading-tight font-extrabold tracking-tight">
                {m.name}
              </span>
              <span
                className={`mode-card-blurb mt-1 block text-[13px] leading-snug ${m.blurbColor}`}
              >
                {m.blurb}
              </span>
            </span>
          </Link>
        ))}
      </section>

      <p className="coming-soon text-ink-muted mt-3 shrink-0 text-[11px] font-bold tracking-[0.18em] uppercase">
        In the works: wordmark · close-up
      </p>

      <footer className="home-footer text-ink-muted mt-2 shrink-0 text-[11px] leading-relaxed">
        <p className="legal-note">
          A memory game, not an affiliation. All marks belong to their owners.{" "}
          <a
            href="mailto:takedown@example.com"
            className="underline underline-offset-2"
          >
            Takedown requests
          </a>
          .
        </p>
        <p className="maker-credit text-ink mt-1.5 font-semibold">
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
