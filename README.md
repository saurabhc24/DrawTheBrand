# Brandr (working title)

A brand-logo memory game: you recognize every logo instantly — but can you name the exact
shade, place a palette with no shapes, or call a brand from one zoomed-in sliver?

Live modes: **Palette** (name the brand from proportional color blocks), **Exact shade**
(the logo is shown desaturated; pick its real hex from near-identical swatches), **Real
or fake** (spot the doctored logo — fakes are generated procedurally from the real asset
via seeded hue shifts and proportion squeezes, [lib/fake.ts](lib/fake.ts)), and **Draw
from memory** (sketch the logo; scored 0–100 against the real mark via a
position/scale-normalized, edge-based chamfer similarity — [lib/drawScore.ts](lib/drawScore.ts)).
Plus Mixed sessions. Every round runs on a clock — 5 s for guess rounds, 30 s for
drawing. Wordmark mode is data-ready but not yet built; the earlier Close-up (crop)
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
  hex chips, fun fact). The progress bar is a printer's color bar: each correct round fills a
  chip with that brand's real primary color — it is also the future share card.
- No backend, no state library. Session-only state, `sessionStorage` for best streak.

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
- Replace the placeholder takedown email in [app/page.tsx](app/page.tsx).
- Pick the real product name (PRD open decision #1).
