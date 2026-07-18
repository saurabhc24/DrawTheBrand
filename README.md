# Brandr (working title)

A brand-logo memory game: you recognize every logo instantly — but can you name the exact
shade, place a palette with no shapes, or call a brand from one zoomed-in sliver?

Phase 1 build per the PRD: modes **A (Palette)**, **B (Exact shade)**, **C (Close-up)**,
plus Mixed sessions and Indian / Global packs. Modes D–F (wordmark, real-or-fake, draw)
are data-ready but not yet built.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # fully static — deploys to Vercel as-is
```

## How it's put together

- **One dataset drives everything** — [data/brands.json](data/brands.json) holds 15 brands
  (8 Indian, 7 global). Mode eligibility is derived from which fields a brand has
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

## Before shipping publicly

- **Logo assets in [public/logos/](public/logos/) are simplified placeholder recreations**
  (several are generic-font wordmarks). Replace with accurate SVGs during data collection.
- **Hex codes, Pantone refs, and fun facts are illustrative** — verify each against official
  brand guidelines (PRD §12 note).
- Replace the placeholder takedown email in [app/page.tsx](app/page.tsx).
- Pick the real product name (PRD open decision #1).
