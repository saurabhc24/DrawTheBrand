import { CHIPS } from "../data";

/** Strip geometries: the title's calibration strip and the reel's progress bar. */
export type StripGeom = { x: number; y: number; w: number; h: number; gap: number };
export const STRIP_TITLE: StripGeom = { x: 330, y: 640, w: 1260, h: 18, gap: 5 };
export const STRIP_BAR: StripGeom = { x: 660, y: 1004, w: 600, h: 8, gap: 3 };

export const chipRect = (g: StripGeom, i: number) => {
  const w = (g.w - g.gap * (CHIPS - 1)) / CHIPS;
  return { x: g.x + i * (w + g.gap), y: g.y, w, h: g.h };
};

export const lerpGeom = (a: StripGeom, b: StripGeom, t: number): StripGeom => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
  gap: a.gap + (b.gap - a.gap) * t,
});
