import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { RegMark } from "../components/Print";
import { C, E, MONO, mix, tw } from "../theme";

export const REGISTRATION_FRAMES = 180;

const PLATES = [
  { color: C.cyan, dx: -22, dy: 10 },
  { color: C.magenta, dx: 18, dy: -14 },
  { color: C.process, dx: 8, dy: 20 },
];

/**
 * Cold open: a registration target draws itself, splits into its process
 * plates, and springs back into register — the press calibrating before the
 * run. The frame's crop marks fly out of it (see Frame.tsx).
 */
export const Registration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = tw(frame, 8, 58, E.inOut);
  const split = tw(frame, 60, 72, E.out);
  const register = spring({ frame: frame - 78, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const offset = split * (1 - register); // plates fly apart, then spring home
  const exit = tw(frame, 138, 170, E.in);
  const size = 190 * (1 - 0.45 * tw(frame, 100, 140, E.inOut));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          scale: String(1 - exit),
          rotate: `${exit * 90}deg`,
        }}
      >
        {PLATES.map((p) => (
          <div
            key={p.color}
            style={{
              position: "absolute",
              inset: 0,
              mixBlendMode: "multiply",
              opacity: split * (1 - tw(frame, 118, 132)),
              translate: `${p.dx * offset}px ${p.dy * offset}px`,
            }}
          >
            <RegMark size={size} color={p.color} stroke={3.5} />
          </div>
        ))}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - split + tw(frame, 108, 124) }}>
          <RegMark size={size} progress={draw} stroke={3.5} />
        </div>
      </div>

      {/* Plate check: C M Y K chips light as the plates come home. */}
      <div style={{ position: "absolute", top: 540 + 150, display: "flex", gap: 26 }}>
        {[C.cyan, C.magenta, C.process, C.ink].map((c, i) => {
          const on = tw(frame, 66 + i * 6, 80 + i * 6, E.back);
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                opacity: on * (1 - exit),
                translate: `0px ${(1 - on) * 14}px`,
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 600,
                color: C.muted,
                letterSpacing: "0.1em",
              }}
            >
              <span style={{ width: 16, height: 16, borderRadius: 4, background: c, scale: String(mix(0.4, 1, on)) }} />
              {"CMYK"[i]}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
