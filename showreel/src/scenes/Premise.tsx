import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { CropMarks, Stamp } from "../components/Print";
import { WordRise } from "../components/Type";
import { FLICKER, logo } from "../data";
import { C, E, MONO, SANS, mix, shake, tw } from "../theme";

export const PREMISE_FRAMES = 360;

const line: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 78,
  letterSpacing: "-0.02em",
  color: C.ink,
  fontVariationSettings: "'wdth' 100",
};

/** "You've seen these logos 10,000× — what actually stuck?" */
export const Premise: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(10000 * tw(frame, 46, 124, E.out));
  const big = tw(frame, 40, 70);
  const out = tw(frame, 300, 336, E.in);
  const card = tw(frame, 44, 66, E.back) * (1 - out);
  const flick = Math.floor((frame - 46) / 3);
  const asking = frame >= 128;
  return (
    <AbsoluteFill style={{ translate: `${shake(frame, 200, 16, 9)}px ${shake(frame, 200, 16, 5)}px` }}>
      <div style={{ position: "absolute", top: 262, width: "100%", textAlign: "center", ...line }}>
        <WordRise text="You've seen these logos" at={8} out={300} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 366,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 56,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 300,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            fontVariantNumeric: "tabular-nums",
            fontVariationSettings: `'wdth' ${mix(100, 125, big)}`,
            color: C.ink,
            opacity: big * (1 - out),
            translate: `0 ${(1 - big) * 40 - out * 60}px`,
          }}
        >
          {count.toLocaleString("en-US")}
          <span style={{ color: C.muted, fontWeight: 700, fontSize: 200, marginLeft: 14 }}>×</span>
        </div>
        {/* Memory flicking past: a logo every three frames, then a blank. */}
        <div style={{ position: "relative", width: 230, height: 230, scale: String(card) }}>
          <CropMarks x={0} y={0} w={230} h={230} progress={card} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: C.card,
              borderRadius: 20,
              boxShadow: `0 0 0 1.5px ${C.rule}`,
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
            }}
          >
            {asking ? (
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 120, color: C.rule }}>?</span>
            ) : (
              <Img src={logo(FLICKER[Math.max(0, flick) % FLICKER.length])} style={{ width: 230, height: 230 }} />
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 742,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 34,
          ...line,
        }}
      >
        <WordRise text="What actually" at={150} out={300} />
        <div style={{ position: "relative", width: 330, height: 100, opacity: 1 - out }}>
          <Stamp text="stuck?" at={196} color={C.flag} size={62} tilt={-5} style={{ left: 0, top: 4 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
