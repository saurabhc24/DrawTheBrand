import React from "react";
import { AbsoluteFill, interpolateColors, random, useCurrentFrame } from "remotion";
import { RegMark } from "../components/Print";
import { STRIP_BAR, STRIP_TITLE, chipRect, lerpGeom } from "../components/Strip";
import { Typewriter } from "../components/Type";
import { BRANDS, CHIPS, CHIP_COLORS, SPECTRUM } from "../data";
import { C, E, SANS, W, H, mix, monoLabel, tw } from "../theme";

export const TITLE_FRAMES = 360;

const TILE = 64;
const COLS = 30; // = CHIPS: each column collapses into one strip chip
const ROWS = 17;
const N = COLS * ROWS;

// Seeded shuffle of start slots; end slots run column-major in spectrum order.
const perm = Array.from({ length: N }, (_, i) => i);
for (let i = N - 1; i > 0; i--) {
  const j = Math.floor(random(`perm${i}`) * (i + 1));
  [perm[i], perm[j]] = [perm[j], perm[i]];
}
const TILES = perm.map((slot, k) => {
  const sx = (slot % COLS) * TILE;
  const sy = Math.floor(slot / COLS) * TILE;
  const dist = Math.hypot(sx + TILE / 2 - W / 2, sy + TILE / 2 - H / 2) / Math.hypot(W / 2, H / 2);
  return {
    col: Math.floor(k / ROWS),
    sx,
    sy,
    ex: Math.floor(k / ROWS) * TILE,
    ey: (k % ROWS) * TILE,
    color: SPECTRUM[Math.floor((k * SPECTRUM.length) / N)],
    pop: 4 + dist * 26 + random(`pop${k}`) * 6, // radial wave from the center
    sort: 46 + random(`sort${k}`) * 16,
  };
});

const backOut = (t: number) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
const collapseAt = (col: number) => 112 + Math.abs(col - (COLS - 1) / 2) * 1.4;

/** The strip's chip rects at this frame: title geometry, then dropping to the bar. */
export const titleStrip = (frame: number) => {
  const drop = tw(frame, 300, 352, E.inOut);
  return { geom: lerpGeom(STRIP_TITLE, STRIP_BAR, drop), drop };
};

/**
 * Title: a mosaic of the roster's real primary colors pops in on a radial
 * wave, sorts itself into a spectrum, and collapses column by column into the
 * calibration strip as the wordmark stretches open along Archivo's width
 * axis. On exit the strip drains to grey and drops into the progress bar.
 */
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { geom, drop } = titleStrip(frame);
  const settled = frame > collapseAt(0) + 40;

  const word = tw(frame, 156, 222);
  const wordOut = tw(frame, 292, 326, E.in);
  const marks = tw(frame, 162, 184, E.back);
  const chip = (i: number) => chipRect(geom, i);
  const regSize = mix(30, 16, drop);
  const regY = geom.y + geom.h / 2 - regSize / 2;

  return (
    <AbsoluteFill>
      {!settled &&
        TILES.map((t, k) => {
          const p = Math.max(0, backOut(tw(frame, t.pop, t.pop + 18, E.linear)));
          const m = tw(frame, t.sort, t.sort + 56, E.inOut);
          const c = tw(frame, collapseAt(t.col), collapseAt(t.col) + 36, E.inOut);
          const r = chip(t.col);
          const x = mix(mix(t.sx, t.ex, m), r.x, c);
          const y = mix(mix(t.sy, t.ey, m), r.y, c);
          const w = mix(TILE + 0.6, r.w, c);
          const h = mix(TILE + 0.6, r.h, c);
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: x + (w * (1 - p)) / 2,
                top: y + (h * (1 - p)) / 2,
                width: w * p,
                height: h * p,
                borderRadius: (r.h / 2) * c,
                background: interpolateColors(c, [0, 1], [t.color, CHIP_COLORS[t.col]]),
              }}
            />
          );
        })}

      {settled &&
        Array.from({ length: CHIPS }, (_, i) => {
          const r = chip(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: r.x,
                top: r.y,
                width: r.w,
                height: r.h,
                borderRadius: r.h / 2,
                background: interpolateColors(drop, [0, 0.7], [CHIP_COLORS[i], C.rule]),
              }}
            />
          );
        })}

      {/* Registration marks bracket the strip and ride it down to the bar. */}
      {[geom.x - 22 - regSize, geom.x + geom.w + 22].map((x, i) => (
        <RegMark key={i} size={regSize} stroke={1.6} style={{ position: "absolute", left: x, top: regY, scale: String(marks) }} />
      ))}

      <div
        style={{
          position: "absolute",
          top: 300,
          width: W,
          textAlign: "center",
          overflow: "hidden",
          height: 320,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 300,
            lineHeight: 1.05,
            color: C.ink,
            letterSpacing: `${mix(0.02, -0.045, word)}em`,
            fontVariationSettings: `'wdth' ${mix(62, 125, word) - wordOut * 50}`,
            opacity: Math.min(1, word * 3) * (1 - wordOut),
            translate: `0 ${(1 - word) * 40 - wordOut * 30}%`,
          }}
        >
          Brandr
        </div>
      </div>

      <div style={{ position: "absolute", top: 700, width: W, textAlign: "center", opacity: 1 - tw(frame, 292, 312, E.in) }}>
        <Typewriter text={`A brand memory test · ${BRANDS.length} brands · 5 tests`} at={204} cps={46} style={monoLabel(22)} />
      </div>
    </AbsoluteFill>
  );
};
