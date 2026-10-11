# DrawTheBrand (Brandr) — project conventions

Brand-logo memory game. Next.js App Router + TS + Tailwind v4, fully static, deployed on
Vercel via GitHub pushes to `main`.

## Code conventions

- **Semantic class names first**: every significant element gets a leading kebab-case
  semantic class before its Tailwind utilities, e.g.
  `className="calibration-strip mt-4 flex h-2.5 gap-[3px]"`. Wrappers, buttons, cards —
  name them all; it makes devtools debugging easy.
- **Prettier + prettier-plugin-tailwindcss** is configured (`.prettierrc`). Run
  `npx prettier --write <files>` after editing JSX/TSX. The plugin keeps custom semantic
  classes at the front.
- Design tokens live in `app/globals.css` under `@theme` (color blocks, feedback colors,
  animations). Game surfaces stay neutral — logo colors are gameplay; color blocks belong
  to chrome only (home cards, results bento, verdict pills).
- App screens are `h-dvh overflow-hidden` frames with an internal `overflow-y-auto`
  region; fixed-height blocks inside flex columns need `shrink-0` or they get crushed on
  short viewports. Scroll regions use `-mx-4 px-4` so rings and shakes at the content edge
  aren't clipped. `overflow-hidden` on a grid item zeroes its automatic min height — keep it
  off cards whose rows must grow to fit content.

## Design system: the press proof

- Prepress furniture is the motif: `crop-marks` (wrap a stimulus; marks live in its
  padding), `stamp` + `ink-texture` (verdicts; color from `text-*`, tilt via `--tilt`),
  `RegMark` at both ends of every color bar. IBM Plex Mono uppercase for labels; Archivo
  `font-stretch-expanded` for display, `semi-expanded` for headings.
- Rounds go question → feedback → reveal. During feedback, question components get the
  `answered` result and show the verdict in place; keyboard input goes through
  `lib/useHotkeys.ts`.
- One `vt-stage` element per screen (the stimulus / main logo) — it's the View Transitions
  shared element; duplicates abort the morph.
- Animate with `translate`/`scale` properties, not `transform`, on anything `.pressable`
  (fill-mode `both` would pin the transform and kill the press). Reduced motion shows base
  styles, so every looping illustration needs a sensible resting state.
- Next's bundled React has no `useEffectEvent`; use a ref.

## Data & assets

- `data/brands.json` drives everything; mode eligibility derives from fields
  (`lib/data.ts`). `colors[0]` must match the on-screen asset — shade mode quizzes on it.
- Logo assets are 512×512 wrapper SVGs in `public/logos/` with the artwork base64-embedded.
  Embedded SVGs **must have a viewBox** or they render stretched.
- `scripts/import-logos.mjs` (Brandfetch; the user's Starter key has a 100 req/month
  quota) and Wikimedia Commons / en.wikipedia fair-use files are the asset sources.
  `scripts/sync-colors.mjs` reconciles palettes with assets.

## Verification before pushing

`npm run build`, then headless Edge screenshots at mobile viewports
(`--force-device-scale-factor=1`, note Chromium clamps window width to 500px min).
The user tests on mobile first and pushes after every feature.
