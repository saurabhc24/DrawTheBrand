# Brandr (working title)

A brand-logo memory game: you recognize every logo instantly — but can you name the exact
shade, place a palette with no shapes, spot a doctored mark, or call a logo before it comes into
focus?

Live modes: **Palette** (name the brand from proportional color blocks), **Exact shade**
(the logo is shown desaturated; pick its real hex from near-identical swatches), **Real
or fake** (spot the doctored logo — fakes are seeded hue rotations and proportion squeezes of
the real asset, sized by measured difficulty: hue fakes target a CIEDE2000 band computed through
the browser's own `hue-rotate()` matrix, easing from obvious to subtle across a session —
[lib/session.ts](lib/session.ts), [lib/delta-e.ts](lib/delta-e.ts), self-check in
[scripts/check-fakes.mjs](scripts/check-fakes.mjs)), and **Draw
from memory** (sketch the logo; scored 0–100 against the real mark via a
position/scale-normalized, edge-based chamfer similarity — [lib/drawScore.ts](lib/drawScore.ts)),
and **Focus** (the real logo pulls into focus from a heavy blur; the distractors share its
dominant color, so the call comes from shape — earlier calls score more,
[components/modes/FocusRound.tsx](components/modes/FocusRound.tsx)). Plus Mixed sessions.
Every round runs on a clock — 5 s for guess rounds, 8 s for focus, 30 s for drawing. A
Wordmark mode is supported by the schema but has no assets yet; the earlier Close-up (crop)
mode was retired in favor of Real or fake.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # fully static — deploys to Vercel as-is
```

## How it's put together

- **One dataset drives everything** — [data/brands.json](data/brands.json) holds ~145 brands
  (roughly half Indian, half global). Mode eligibility is derived from which fields a brand has
  ([lib/data.ts](lib/data.ts)), never special-cased. Add a brand to the JSON and it appears
  in every mode it qualifies for.
- **All randomness is seeded and resolved up front** ([lib/session.ts](lib/session.ts),
  [lib/rng.ts](lib/rng.ts)): brand order, option shuffles, shade distractors
  ([lib/color.ts](lib/color.ts)), fake doctorings and focus lookalikes are fixed when a
  session is built.
- **Shared shell** — every mode renders inside [components/RoundShell.tsx](components/RoundShell.tsx)
  and ends on [components/RevealScreen.tsx](components/RevealScreen.tsx) (real logo, tappable
  spec chips, fun fact). A round runs question → feedback (the verdict shown in place for
  750 ms) → reveal ([app/play/PlayClient.tsx](app/play/PlayClient.tsx)). The progress bar is a
  printer's color bar: each correct round inks a chip with that brand's real primary color.
- No backend, no state library. Session-only state, `sessionStorage` for best streak.

## Design: the press proof

Brands live and die by spec sheets, so the game is staged as a print-shop proofing session.
The flat color-block bento is the chrome; game surfaces stay neutral so the logos supply the
color; prepress furniture does the rest.

- **Print furniture as utilities** ([app/globals.css](app/globals.css)) — `crop-marks` trims
  any stimulus like a press proof (drawn as backgrounds, so scroll containers never clip them),
  `stamp` + `ink-texture` make rubber-stamp verdicts with speckled ink from a thresholded
  `feTurbulence` mask, and registration targets ([components/RegMark.tsx](components/RegMark.tsx))
  bracket every color bar.
- **Type** — Archivo's variable width axis does the heavy lifting: expanded (125%) for display,
  regular for UI, IBM Plex Mono for job-ticket labels.
- **Intro** ([components/Intro.tsx](components/Intro.tsx)) — a mosaic of the roster's real colors
  pops in, sorts itself into a spectrum, then pours into the home page's calibration strip while
  the wordmark FLIPs onto the title; every piece lands on its live counterpart, so the hand-off
  is seamless. A pre-paint gate script keeps the static page from flashing first.
- **Motion with meaning** — each home card animates its own mechanic
  ([components/ModeArt.tsx](components/ModeArt.tsx)); the question's stimulus morphs into the
  reveal via the View Transitions API; streaks pop, chips take ink, the clock ticks red.
  Reduced-motion users get clean stills.
- **Share card** ([lib/shareCard.ts](lib/shareCard.ts)) — the finished run as a 1080×1350 press
  proof (score, rank stamp, color bar, every logo played), drawn by hand on a canvas in the
  page's own fonts and handed to the native share sheet; desktop saves it and copies an emoji
  grid instead.
- **Feel** — haptics on Android for verdicts and the last seconds, 1–4/A–D/R/F/Enter on a
  keyboard, coalesced-pointer + quadratic smoothing on the drawing pad, and a phone-width sheet
  on a cutting mat on desktop.

## Data pipeline

- **Logo assets** are 512×512 wrapper SVGs in [public/logos](public/logos) with the artwork
  base64-embedded (an embedded SVG must have a `viewBox`, or it renders stretched). Sources:
  the Brandfetch Brand API via [scripts/import-logos.mjs](scripts/import-logos.mjs)
  (`node scripts/import-logos.mjs <API_KEY> [--missing] [ids…]`), and Wikipedia / Wikimedia
  Commons logo files. Oversized sources are re-encoded to WebP rather than shipped as-is.
- **Full-bleed logos** (artwork filling the whole canvas, like DHL) declare
  `assets.background` so cards behind them match and a squashed fake never shows the frame.
- [scripts/sync-colors.mjs](scripts/sync-colors.mjs) reconciles `brands.json` hexes with the
  colors actually present in the SVG assets (`--write` to apply), so shade mode always quizzes
  on the color the player is looking at — and flags full-bleed assets missing a background.
- [scripts/check-fakes.mjs](scripts/check-fakes.mjs) self-checks the fake-measuring color math
  (`node --no-warnings scripts/check-fakes.mjs`).

## Showreel

[showreel/](showreel) is a self-contained [Remotion](https://remotion.dev) project: a 55-second,
60fps motion piece built from the game's own tokens, fonts, logos and dataset — every frame is
code. `cd showreel && npm install && npm run render` writes `out/brandr-showreel.mp4`; see its
[README](showreel/README.md) for the scene list. It's excluded from the app's TypeScript and
Tailwind builds.

## Before shipping publicly

- **Fun facts and remaining hex values are best-effort** — verify against official brand
  guidelines before launch (PRD §12 note). Raster (PNG/WebP) assets can't be auto-synced;
  check those brands' colors by eye.
- Pick the real product name (PRD open decision #1).
