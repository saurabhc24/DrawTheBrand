# Brandr (working title)

A brand-logo memory game: you recognize every logo instantly — but can you name the exact
shade, place a palette with no shapes, or call a brand from one zoomed-in sliver?

Live modes: **Palette** (name the brand from proportional color blocks), **Exact shade**
(the logo is shown desaturated; pick its real hex from near-identical swatches), **Real
or fake** (spot the doctored logo — fakes are generated procedurally from the real asset
via seeded hue shifts and proportion squeezes, [lib/fake.ts](lib/fake.ts)), and **Draw
from memory** (sketch the logo; scored 0–100 against the real mark via a
position/scale-normalized, edge-based chamfer similarity — [lib/drawScore.ts](lib/drawScore.ts)),
and **Focus** (the real logo pulls into focus from a heavy blur; the distractors share its
dominant color, so the call comes from shape — earlier calls score more,
[components/modes/FocusRound.tsx](components/modes/FocusRound.tsx)). Plus Mixed sessions.
Every round runs on a clock — 5 s for guess rounds, 8 s for focus, 30 s for drawing. Wordmark mode is data-ready but not yet built; the earlier Close-up (crop)
mode was retired in favor of Real or fake.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # fully static — deploys to Vercel as-is
```

## How it's put together

- **One dataset drives everything** — [data/brands.json](data/brands.json) holds ~105 brands
  (roughly half Indian, half global). Mode eligibility is derived from which fields a brand has
  ([lib/data.ts](lib/data.ts)), never special-cased. Add a brand to the JSON and it appears
  in every mode it qualifies for.
- **All randomness is seeded and resolved up front** ([lib/session.ts](lib/session.ts),
  [lib/rng.ts](lib/rng.ts)): brand order, option shuffles, shade distractors
  ([lib/color.ts](lib/color.ts)), and crop windows are fixed when a session is built.
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

- [scripts/import-logos.mjs](scripts/import-logos.mjs) does one-time logo imports from the
  Brandfetch Brand API (`node scripts/import-logos.mjs <API_KEY> [--missing] [ids…]`), wrapping
  each asset on the square canvas the game expects.
- [scripts/sync-colors.mjs](scripts/sync-colors.mjs) reconciles `brands.json` hexes with the
  colors actually present in the imported SVGs (`--write` to apply), so shade mode always
  quizzes on the color the player is looking at.

## Before shipping publicly

- **Fun facts and remaining hex values are best-effort** — verify against official brand
  guidelines before launch (PRD §12 note). PNG-based assets can't be auto-synced; check
  those brands' colors by eye.
- Pick the real product name (PRD open decision #1).
