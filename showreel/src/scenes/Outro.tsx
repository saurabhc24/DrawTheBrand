import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RegMark } from "../components/Print";
import { Typewriter } from "../components/Type";
import { C, E, SANS, W, mix, monoLabel, tw } from "../theme";

export const OUTRO_FRAMES = 360;

/**
 * Bookend: the strip (Frame.tsx) rises back to center, the wordmark stretches
 * open over it, then everything converges and the registration mark
 * "unprints" into its process plates.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const word = tw(frame, 40, 104);
  const out = tw(frame, 232, 262, E.in);
  const draw = tw(frame, 288, 314, E.inOut);
  const split = tw(frame, 320, 340, E.out);
  const gone = tw(frame, 334, 356, E.in);
  const plates = [
    { color: C.cyan, dx: -1, dy: 0.5 },
    { color: C.magenta, dx: 0.8, dy: -0.7 },
    { color: C.process, dx: 0.3, dy: 1 },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 300, width: W, height: 320, overflow: "hidden", textAlign: "center" }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 300,
            lineHeight: 1.05,
            color: C.ink,
            letterSpacing: `${mix(0.02, -0.045, word)}em`,
            fontVariationSettings: `'wdth' ${mix(62, 125, word) - out * 50}`,
            opacity: Math.min(1, word * 3) * (1 - out),
            translate: `0 ${(1 - word) * 40 - out * 30}%`,
          }}
        >
          Brandr
        </div>
      </div>
      <div style={{ position: "absolute", top: 704, width: W, textAlign: "center", opacity: 1 - out }}>
        <Typewriter text="draw-the-brand.vercel.app" at={108} cps={30} style={monoLabel(30, C.ink)} />
      </div>
      <div style={{ position: "absolute", top: 766, width: W, textAlign: "center", opacity: tw(frame, 168, 196) * (1 - out), ...monoLabel(18) }}>
        Made by Saurabh Chandra
      </div>

      {/* The final mark: drawn where the crop marks converge, then unprinted. */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 150, height: 150, opacity: draw > 0 ? 1 : 0 }}>
          {plates.map((p) => (
            <div
              key={p.color}
              style={{
                position: "absolute",
                inset: 0,
                mixBlendMode: "multiply",
                opacity: split * (1 - gone),
                translate: `${p.dx * 34 * split}px ${p.dy * 34 * split}px`,
              }}
            >
              <RegMark size={150} color={p.color} stroke={3} />
            </div>
          ))}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - split }}>
            <RegMark size={150} progress={draw} stroke={3} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
