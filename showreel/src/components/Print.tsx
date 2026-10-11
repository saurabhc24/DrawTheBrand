import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, mix, tw } from "../theme";

/** Registration target. `progress` 0→1 draws it: ring sweeps, crosshair grows. */
export const RegMark: React.FC<{
  size: number;
  progress?: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
}> = ({ size, progress = 1, color = C.ink, stroke = 1.4, style }) => {
  const ring = 2 * Math.PI * 26;
  const arm = 50 * Math.min(1, progress * 1.25);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
      <circle
        cx={50}
        cy={50}
        r={26}
        fill="none"
        stroke={color}
        strokeWidth={(stroke * 100) / size}
        strokeDasharray={ring}
        strokeDashoffset={ring * (1 - progress)}
        transform="rotate(-90 50 50)"
      />
      <path
        d={`M50 ${50 - arm}V${50 + arm}M${50 - arm} 50H${50 + arm}`}
        stroke={color}
        strokeWidth={(stroke * 100) / size}
      />
    </svg>
  );
};

/**
 * Trim marks around the rect (x, y, w, h), drawn outside it with a gap.
 * `progress` grows each mark out from the corner.
 */
export const CropMarks: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  progress?: number;
  gap?: number;
  len?: number;
  color?: string;
}> = ({ x, y, w, h, progress = 1, gap = 12, len = 24, color = "rgba(19,19,19,0.5)" }) => {
  const l = len * progress;
  const corners = [
    [x, y, -1, -1],
    [x + w, y, 1, -1],
    [x, y + h, -1, 1],
    [x + w, y + h, 1, 1],
  ];
  const line = (left: number, top: number, width: number, height: number, key: string) => (
    <div key={key} style={{ position: "absolute", left, top, width, height, background: color }} />
  );
  return (
    <>
      {corners.flatMap(([cx, cy, dx, dy], i) => [
        // horizontal arm, running outward from the corner
        line(dx < 0 ? cx - gap - l : cx + gap, cy - 0.75, l, 1.5, `h${i}`),
        // vertical arm
        line(cx - 0.75, dy < 0 ? cy - gap - l : cy + gap, 1.5, l, `v${i}`),
      ])}
    </>
  );
};

const INK_NOISE = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='i'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -7 4.9'/></filter><rect width='160' height='160' filter='url(%23i)'/></svg>")`;

/** A rubber stamp slammed at frame `at`: double rule, tilt, worn ink. */
export const Stamp: React.FC<{
  text: string;
  at: number;
  color?: string;
  size?: number;
  tilt?: number;
  style?: React.CSSProperties;
}> = ({ text, at, color = C.proof, size = 34, tilt = -6, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 260, mass: 0.7 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        padding: `${size * 0.22}px ${size * 0.5}px`,
        border: `${size * 0.11}px solid ${color}`,
        outline: `${size * 0.06}px solid ${color}`,
        outlineOffset: size * 0.1,
        borderRadius: size * 0.2,
        color,
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.16em",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        opacity: Math.min(1, hit * 3),
        scale: String(mix(2.6, 1, hit)),
        rotate: `${mix(tilt - 14, tilt, hit)}deg`,
        WebkitMaskImage: INK_NOISE,
        maskImage: INK_NOISE,
        WebkitMaskSize: "160px",
        maskSize: "160px",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** White proof card with a hairline, optional crop marks drawn around it. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  marks?: number;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, marks, radius = 22, style, children }) => (
  <>
    {marks !== undefined && <CropMarks x={x} y={y} w={w} h={h} progress={marks} />}
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: C.card,
        borderRadius: radius,
        boxShadow: `0 0 0 1.5px ${C.rule}`,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  </>
);

/** Fade + lift helper for elements entering at `from`. */
export const useEnter = (from: number, dur = 30, dist = 24) => {
  const frame = useCurrentFrame();
  const t = tw(frame, from, from + dur);
  return { opacity: t, translate: `0px ${(1 - t) * dist}px` } as const;
};
