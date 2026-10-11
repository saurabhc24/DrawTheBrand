import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

/** The game's own tokens (app/globals.css), so the reel is the product. */
export const C = {
  paper: "#FDFCFA",
  card: "#FFFFFF",
  tile: "#F4F1EC",
  ink: "#131313",
  muted: "#6F6F74",
  rule: "#E7E4DE",
  proof: "#1E4633",
  flag: "#E0442A",
  orange: "#F2732E",
  pink: "#F4B8DD",
  yellow: "#F5C63C",
  olive: "#A8B33B",
  green: "#1E4633",
  cyan: "#00AEEF",
  magenta: "#EC008C",
  process: "#FFE600",
};

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** Seconds → frames. */
export const sec = (s: number) => Math.round(s * FPS);

// Variable Archivo: weight and width are both live axes.
export const SANS = "Archivo";
export const MONO = "Plex Mono";
loadFont({
  family: SANS,
  url: staticFile("fonts/archivo-var.woff2"),
  weight: "100 900",
  stretch: "62% 125%",
});
for (const weight of ["400", "500", "600"]) {
  loadFont({
    family: MONO,
    url: staticFile(`fonts/plexmono-${weight}.woff2`),
    weight,
  });
}

/** One easing language for the whole reel. */
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // arrivals: fast, then a long settle
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits: gather, then go
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // moves between two rests
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // pops with a little overshoot
  linear: Easing.linear,
};

/** Clamped 0→1 progress of `frame` across [from, to]. */
export const tw = (frame: number, from: number, to: number, easing = E.out) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Damped shake, for stamp impacts: decays to rest over `dur` frames. */
export const shake = (frame: number, at: number, dur = 14, amp = 7) => {
  const t = frame - at;
  if (t < 0 || t > dur) return 0;
  return Math.sin(t * 2.3) * amp * (1 - t / dur) ** 2;
};

/** Shared label style: the job-ticket mono. */
export const monoLabel = (size = 18, color = C.muted) =>
  ({
    fontFamily: MONO,
    fontWeight: 500,
    fontSize: size,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color,
  }) as const;
