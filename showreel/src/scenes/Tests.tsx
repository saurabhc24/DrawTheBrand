import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, E, MONO, SANS, W, mix, tw } from "../theme";

export const TESTS_FRAMES = 210;

export const MODES = [
  { letter: "A", name: "Palette", color: C.orange, ink: "#FFFFFF" },
  { letter: "B", name: "Exact shade", color: C.pink, ink: C.ink },
  { letter: "C", name: "Real or fake", color: C.yellow, ink: C.ink },
  { letter: "D", name: "Draw", color: C.green, ink: C.paper },
  { letter: "E", name: "Focus", color: C.olive, ink: C.ink },
];

const SWOOSH = "M14 92 C 36 116, 80 102, 146 22 C 104 66, 62 86, 40 78";
const SPARKLE = "M16 2C17 11 21 15 30 16C21 17 17 21 16 30C15 21 11 17 2 16C11 15 15 11 16 2Z";

/** Each mode's mechanic in miniature, frame-driven (same ideas as the home cards). */
const MiniArt: React.FC<{ i: number; ink: string; f: number }> = ({ i, ink, f }) => {
  const wave = (phase: number) => (Math.sin((f / 60) * 2.2 + phase) + 1) / 2;
  if (i === 0)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 120, height: 170 }}>
        {[1, 0.6, 0.3].map((o, k) => (
          <div key={k} style={{ flexGrow: 1 + wave(k * 2.1) * 2.2, flexBasis: 0, borderRadius: 10, background: ink, opacity: o }} />
        ))}
      </div>
    );
  if (i === 1) {
    const pick = Math.floor(f / 22) % 4;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "64px 64px", gap: 14 }}>
        {["#C2185B", "#CC2468", "#B71456", "#C91E62"].map((c, k) => (
          <div
            key={c}
            style={{
              height: 64,
              borderRadius: 14,
              background: c,
              translate: `0 ${k === pick ? -8 : 0}px`,
              boxShadow: k === pick ? `0 0 0 4px ${C.ink}` : "none",
            }}
          />
        ))}
      </div>
    );
  }
  if (i === 2) {
    const squash = mix(1, 0.64, Math.round(wave(0)));
    return (
      <svg width={170} height={116} viewBox="0 0 48 32" style={{ scale: `${squash} 1` }}>
        <circle cx="17" cy="16" r="12.5" fill={ink} />
        <circle cx="31" cy="16" r="12.5" fill="none" stroke={ink} strokeWidth="3" />
      </svg>
    );
  }
  if (i === 3) {
    const t = (f % 90) / 60;
    return (
      <svg width={200} height={140} viewBox="0 0 160 112" fill="none">
        <path
          d={SWOOSH}
          pathLength={1}
          stroke={ink}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1"
          strokeDashoffset={1 - Math.min(1, t)}
        />
      </svg>
    );
  }
  const lock = wave(-1.2) > 0.5;
  return (
    <div style={{ position: "relative", width: 170, height: 170, display: "grid", placeItems: "center" }}>
      <svg
        viewBox="0 0 64 64"
        width={170}
        height={170}
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinecap="round"
        style={{ position: "absolute", scale: lock ? "1" : "1.16", opacity: lock ? 1 : 0.5 }}
      >
        <path d="M4 18V4h14M46 4h14v14M60 46v14H46M18 60H4V46" />
      </svg>
      <svg viewBox="0 0 32 32" width={84} height={84} style={{ filter: `blur(${lock ? 0 : 6}px)` }}>
        <path d={SPARKLE} fill={ink} />
      </svg>
    </div>
  );
};

/**
 * The five tests, as color-block columns rising in sequence. On exit four of
 * them lift away while Palette's orange widens to fill the frame — the cover
 * the first mode scene opens under.
 */
export const Tests: React.FC = () => {
  const frame = useCurrentFrame();
  const colW = W / 5;
  return (
    <AbsoluteFill>
      {MODES.map((m, i) => {
        const rise = tw(frame, 6 + i * 7, 46 + i * 7);
        const leave = i === 0 ? 0 : tw(frame, 150 + (4 - i) * 6, 182 + (4 - i) * 6, E.in);
        const widen = i === 0 ? tw(frame, 168, 206, E.inOut) : 0;
        return (
          <div
            key={m.letter}
            style={{
              position: "absolute",
              left: mix(i * colW, 0, widen),
              top: 0,
              width: mix(colW + 1, W, widen),
              height: "100%",
              background: m.color,
              color: m.ink,
              translate: `0 ${(1 - rise) * 100 - leave * 100}%`,
              zIndex: i === 0 ? 1 : 0,
            }}
          >
            <div style={{ opacity: 1 - tw(frame, 160, 176, E.in), height: "100%" }}>
              <div style={{ position: "absolute", left: 40, top: 110, fontFamily: SANS, fontWeight: 900, fontSize: 150, lineHeight: 1, fontVariationSettings: "'wdth' 125" }}>
                {m.letter}
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "grid", placeItems: "center", height: 220 }}>
                <MiniArt i={i} ink={m.ink} f={frame} />
              </div>
              <div style={{ position: "absolute", left: 40, bottom: 150 }}>
                <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 500, letterSpacing: "0.16em", opacity: 0.7 }}>
                  TEST 0{i + 1}
                </div>
                <div style={{ marginTop: 12, fontFamily: SANS, fontWeight: 850, fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em", fontVariationSettings: "'wdth' 112" }}>
                  {m.name}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
