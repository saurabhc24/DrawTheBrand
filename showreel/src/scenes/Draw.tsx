import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { ModeScene } from "../components/Mode";
import { Card, Stamp } from "../components/Print";
import { logo } from "../data";
import { C, E, MONO, SANS, tw } from "../theme";

const PAD = { x: 1070, y: 140, w: 460, h: 460 };
// A from-memory swoosh: the sweep, then the returning top edge.
const STROKES = [
  { d: "M 96 222 C 52 276, 74 306, 128 292 C 214 272, 322 214, 408 166", from: 60, to: 140 },
  { d: "M 404 170 C 300 202, 192 240, 136 254", from: 146, to: 178 },
];
const SCORE = 73;
const PASS = 60;

/** Mode D — sketch it from memory; get scored against the real mark. */
export const Draw: React.FC = () => {
  const frame = useCurrentFrame();
  const onion = tw(frame, 182, 210);
  const meter = tw(frame, 196, 250);
  const active = STROKES.find((s) => frame >= s.from && frame <= s.to + 4);
  const pen = active
    ? getPointAtLength(active.d, getLength(active.d) * tw(frame, active.from, active.to, E.inOut))
    : null;
  return (
    <ModeScene color={C.green} letter="D" name="Draw" blurb="Sketch it from memory. Get scored." next={C.olive}>
      <AbsoluteFill>
        <Card
          {...PAD}
          marks={tw(frame, 30, 60)}
          style={{
            opacity: tw(frame, 30, 50),
            backgroundImage: "radial-gradient(circle, rgba(19,19,19,0.14) 1.6px, transparent 2px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "center",
          }}
        >
          <Img src={logo("nike")} style={{ position: "absolute", inset: 0, width: PAD.w, height: PAD.h, opacity: onion * 0.3 }} />
          <svg width={PAD.w} height={PAD.h} style={{ position: "absolute", inset: 0 }} fill="none">
            {STROKES.map((s) => (
              <path
                key={s.d}
                d={s.d}
                pathLength={1}
                stroke={C.ink}
                strokeWidth={13}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                strokeDashoffset={1 - tw(frame, s.from, s.to, E.inOut)}
              />
            ))}
            {pen && <circle cx={pen.x} cy={pen.y} r={11} fill={C.yellow} stroke={C.ink} strokeWidth={3} />}
          </svg>
        </Card>

        <div style={{ position: "absolute", left: PAD.x, top: 650, width: PAD.w, opacity: tw(frame, 186, 206) }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 18, fontWeight: 500, letterSpacing: "0.14em", color: C.muted }}>
            <span>SIMILARITY</span>
            <span>PASS AT {PASS}</span>
          </div>
          <div style={{ position: "relative", marginTop: 14, height: 16, borderRadius: 99, background: C.rule }}>
            <div style={{ height: "100%", width: `${SCORE * meter}%`, borderRadius: 99, background: C.proof }} />
            <div style={{ position: "absolute", left: `${PASS}%`, top: -6, bottom: -6, width: 3, borderRadius: 2, background: C.ink }} />
          </div>
          <div style={{ marginTop: 16, fontFamily: SANS, fontWeight: 900, fontSize: 64, lineHeight: 1, fontVariationSettings: "'wdth' 125", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(SCORE * meter)}
            <span style={{ fontSize: 30, color: C.muted, fontWeight: 700 }}>/100</span>
          </div>
        </div>
        <Stamp text={`${SCORE}/100`} at={252} color={C.proof} size={34} style={{ left: 1384, top: 112 }} />
      </AbsoluteFill>
    </ModeScene>
  );
};
