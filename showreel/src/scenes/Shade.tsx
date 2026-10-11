import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { ModeScene } from "../components/Mode";
import { Card, Stamp } from "../components/Print";
import { Scramble } from "../components/Type";
import { brand, logo } from "../data";
import { C, E, MONO, tw } from "../theme";

const TRUE_HEX = brand("cadbury").colors[0].hex.toUpperCase(); // #4B2E83
const SWATCHES = ["#5A3D93", TRUE_HEX, "#3E256F", "#57318C"];
const CHIP = { y: 540, w: 182, h: 232, gap: 30 };
const chipX = (i: number) => 1300 - (4 * CHIP.w + 3 * CHIP.gap) / 2 + i * (CHIP.w + CHIP.gap);
// The selection ring scans, hesitates, and lands on the true swatch.
const SCAN = [
  { f: 70, i: 0 },
  { f: 92, i: 2 },
  { f: 112, i: 3 },
  { f: 138, i: 1 },
];

/** Mode B — the logo drained to grey; one swatch is the real hex. */
export const Shade: React.FC = () => {
  const frame = useCurrentFrame();
  const ringX = interpolate(frame, SCAN.map((s) => s.f), SCAN.map((s) => chipX(s.i)), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: E.inOut,
  });
  const ringOn = tw(frame, 64, 76) * (1 - tw(frame, 160, 170));
  const flood = tw(frame, 176, 232, E.inOut);
  return (
    <ModeScene color={C.pink} letter="B" name="Exact shade" blurb="The logo's drained. One swatch is the real hex." next={C.yellow}>
      <AbsoluteFill>
        <Card x={1150} y={170} w={300} h={300} marks={tw(frame, 30, 60)} style={{ opacity: tw(frame, 30, 50) }}>
          <Img src={logo("cadbury")} style={{ position: "absolute", inset: 0, width: 300, height: 300, filter: "grayscale(1)" }} />
          {/* Color floods back in from the swatch row once it's called. */}
          <Img
            src={logo("cadbury")}
            style={{ position: "absolute", inset: 0, width: 300, height: 300, clipPath: `circle(${flood * 160}% at 50% 120%)` }}
          />
        </Card>

        {SWATCHES.map((hex, i) => {
          const enter = tw(frame, 40 + i * 6, 76 + i * 6);
          const isTrue = hex === TRUE_HEX;
          const verdict = tw(frame, 172, 184);
          const pressed = isTrue ? tw(frame, 146, 150) * (1 - tw(frame, 150, 160)) : 0;
          return (
            <div
              key={hex}
              style={{
                position: "absolute",
                left: chipX(i),
                top: CHIP.y,
                width: CHIP.w,
                height: CHIP.h,
                borderRadius: 22,
                overflow: "hidden",
                background: C.card,
                boxShadow: isTrue && verdict > 0 ? `0 0 0 ${4 * verdict}px ${C.proof}` : `0 0 0 1.5px ${C.rule}`,
                opacity: enter * (isTrue ? 1 : 1 - verdict * 0.6),
                translate: `0px ${(1 - enter) * 50}px`,
                scale: String(1 - pressed * 0.04),
              }}
            >
              <div style={{ height: 160, background: hex }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px", height: 72, fontFamily: MONO, fontSize: 19 }}>
                <span style={{ fontWeight: 600 }}>{"ABCD"[i]}</span>
                <Scramble
                  text={hex}
                  at={156 + i * 3}
                  dur={24}
                  seed={`sw${i}`}
                  style={{ color: isTrue && verdict > 0.5 ? C.proof : C.muted, fontWeight: isTrue ? 600 : 500 }}
                />
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: ringX - 12,
            top: CHIP.y - 12,
            width: CHIP.w + 24,
            height: CHIP.h + 24,
            borderRadius: 30,
            border: `4px solid ${C.ink}`,
            opacity: ringOn,
          }}
        />
        <Stamp text={TRUE_HEX} at={214} color={C.proof} size={30} tilt={-5} style={{ left: 1380, top: 150 }} />
      </AbsoluteFill>
    </ModeScene>
  );
};
