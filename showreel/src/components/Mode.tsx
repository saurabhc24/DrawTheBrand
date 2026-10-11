import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, E, MONO, SANS, W, mix, monoLabel, tw } from "../theme";
import { Typewriter, WordRise } from "./Type";

export const MODE_FRAMES = 300;

/**
 * Every mode vignette: it opens covered by its block color, which sweeps off
 * to reveal the scene, and closes with the next mode's color sweeping on — so
 * each cut happens under full cover. The label column runs the same
 * choreography for all five, so the mechanics are what change.
 */
export const ModeScene: React.FC<{
  color: string;
  letter: string;
  name: string;
  blurb: string;
  next: string | null;
  isNew?: boolean;
  children: React.ReactNode;
}> = ({ color, letter, name, blurb, next, isNew, children }) => {
  const frame = useCurrentFrame();
  const reveal = tw(frame, 0, 32, E.inOut);
  const cover = next ? tw(frame, MODE_FRAMES - 22, MODE_FRAMES, E.in) : 0;
  const fadeOut = next ? 0 : tw(frame, MODE_FRAMES - 34, MODE_FRAMES - 4, E.in);
  const nameIn = tw(frame, 26, 70);
  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      <AbsoluteFill name="Mode label" style={{ left: 150, top: 330, width: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: color,
              scale: String(tw(frame, 24, 44, E.back)),
              boxShadow: color === C.paper ? `0 0 0 1px ${C.rule}` : undefined,
            }}
          />
          <Typewriter text={`Mode ${letter}`} at={30} cps={24} style={monoLabel(22)} />
          {isNew && (
            <span
              style={{
                ...monoLabel(15, C.paper),
                background: C.ink,
                padding: "5px 12px",
                borderRadius: 99,
                scale: String(tw(frame, 52, 70, E.back)),
              }}
            >
              New
            </span>
          )}
        </div>
        <div style={{ overflow: "hidden", marginTop: 18, paddingBottom: 8 }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 850,
              fontSize: 132,
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: C.ink,
              translate: `0 ${(1 - nameIn) * 105}%`,
              // The width axis opens up as the name lands.
              fontVariationSettings: `'wdth' ${mix(80, 112, nameIn)}`,
            }}
          >
            {name}
          </div>
        </div>
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 38, lineHeight: 1.3, color: C.muted }}>
          <WordRise text={blurb} at={48} stagger={3} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill name="Stage">{children}</AbsoluteFill>

      {/* Cover bands: own color leaving, next color arriving. */}
      <AbsoluteFill style={{ background: color, translate: `${reveal * W}px 0px` }} />
      {next && <AbsoluteFill style={{ background: next, translate: `${(cover - 1) * W}px 0px` }} />}
    </AbsoluteFill>
  );
};

/** A touch-point cursor gliding between keyframes and pressing at `press`. */
export const Cursor: React.FC<{
  keys: { f: number; x: number; y: number }[];
  press: number;
}> = ({ keys, press }) => {
  const frame = useCurrentFrame();
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E.inOut } as const;
  const x = interpolate(frame, keys.map((k) => k.f), keys.map((k) => k.x), opts);
  const y = interpolate(frame, keys.map((k) => k.f), keys.map((k) => k.y), opts);
  const shown = tw(frame, keys[0].f, keys[0].f + 12) * (1 - tw(frame, press + 30, press + 46));
  const down = tw(frame, press - 6, press, E.out) * (1 - tw(frame, press, press + 10, E.out));
  const ripple = tw(frame, press, press + 26, E.out);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: shown }}>
      <div
        style={{
          position: "absolute",
          left: -45,
          top: -45,
          width: 90,
          height: 90,
          borderRadius: "50%",
          border: `2px solid ${C.ink}`,
          opacity: frame >= press ? 0.5 * (1 - ripple) : 0,
          scale: String(mix(0.3, 1, ripple)),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -17,
          top: -17,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(19,19,19,0.82)",
          boxShadow: "0 0 0 4px rgba(255,255,255,0.9), 0 8px 18px rgba(0,0,0,0.18)",
          scale: String(1 - down * 0.25),
        }}
      />
    </div>
  );
};

/** Mono key letter in the corner of an option. */
export const Key: React.FC<{ k: string; light?: boolean }> = ({ k, light }) => (
  <span style={{ position: "absolute", left: 18, top: 12, fontFamily: MONO, fontSize: 15, fontWeight: 600, opacity: light ? 0.7 : 0.45 }}>
    {k}
  </span>
);
