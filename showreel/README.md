# Brandr — showreel

A 55-second, 60fps motion piece for the game, built in [Remotion](https://remotion.dev) from
the game's own design system: the same tokens, fonts (variable Archivo, IBM Plex Mono),
logos (synced from `../public/logos`), and `data/brands.json`. No screen recordings —
every frame is code.

```bash
npm install
npm run dev      # Remotion Studio: scrub every scene
npm run render   # → out/brandr-showreel.mp4 (1920×1080, 60fps)
```

## The run

| # | Scene | What moves |
|---|-------|-----------|
| 01 | Registration | A registration target draws itself, splits into C/M/Y plates, springs back into register; the crop marks fly out of it to frame the sheet. |
| 02 | Title | 510 tiles in the roster's real colors pop on a radial wave, sort into a spectrum, collapse column by column into the calibration strip; the wordmark stretches open along Archivo's width axis. |
| 03 | Premise | "You've seen these logos 10,000×" — the count races while real logos flicker past, then *stuck?* lands as a rubber stamp. |
| 04 | Five tests | Block-color columns rise, each running its mechanic in miniature; orange widens to cover the cut. |
| 05–09 | The modes | Palette, Exact shade, Real or fake, Draw, Focus — each opens under its own color and closes under the next one's. |
| 10 | Proof | The share card assembles with spec callouts. |
| 11 | Press OK | The bookend: the strip rises back under the wordmark, then everything converges and the registration mark unprints. |

Across the whole run, [`Frame.tsx`](src/components/Frame.tsx) keeps the press sheet: crop
marks, slug lines with a sheet counter and timecode, and a progress strip — the game's color
bar — that drains during the title and inks back a chip at a time.

One easing vocabulary ([`theme.ts`](src/theme.ts)) drives everything: expo-out arrivals,
expo-in exits, in-out moves, a back-out pop, and springs for stamps and ink.
