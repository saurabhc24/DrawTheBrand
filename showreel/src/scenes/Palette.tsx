import React from "react";
import { AbsoluteFill, Img, interpolateColors, useCurrentFrame } from "remotion";
import { Cursor, Key, ModeScene } from "../components/Mode";
import { Card, Stamp } from "../components/Print";
import { brand, logo } from "../data";
import { C, E, MONO, SANS, mix, tw } from "../theme";

const OPTIONS = ["Shell", "McDonald's", "DHL", "Maggi"]; // all red-and-yellow: color alone won't do it
const CARD = { x: 900, y: 230, w: 360, h: 480 };
const PILL = { x: 1330, y: 345, w: 370, h: 84, gap: 18 };

/** Mode A — name the brand from its colors, in proportion. */
export const Palette: React.FC = () => {
  const frame = useCurrentFrame();
  const bands = brand("mcdonalds").colors;
  const morph = tw(frame, 192, 232, E.inOut);
  let grown = 0;
  return (
    <ModeScene color={C.orange} letter="A" name="Palette" blurb="Name the brand from its colors alone." next={C.pink}>
      <AbsoluteFill>
        <Card {...CARD} marks={tw(frame, 30, 60)} style={{ opacity: tw(frame, 30, 50) }}>
          {/* Bands print top-down at their share of the logo. */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - morph, scale: String(mix(1, 0.9, morph)) }}>
            {bands.map((b, i) => {
              const share = b.proportion ?? 1 / bands.length;
              const top = grown;
              grown += share;
              const t = tw(frame, 44 + i * 26, 84 + i * 26);
              const light = b.hex.toUpperCase() === "#FDBB20";
              return (
                <div
                  key={b.hex}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: top * CARD.h,
                    height: share * CARD.h * t,
                    background: b.hex,
                  }}
                >
                  <span style={{ position: "absolute", left: 22, top: 18, fontFamily: MONO, fontSize: 17, letterSpacing: "0.12em", color: light ? C.ink : "#fff", opacity: 0.7 * t }}>
                    0{i + 1} · {Math.round(share * 100 * t)}%
                  </span>
                </div>
              );
            })}
          </div>
          <Img
            src={logo("mcdonalds")}
            style={{ position: "absolute", left: 0, top: (CARD.h - CARD.w) / 2, width: CARD.w, height: CARD.w, opacity: morph, scale: String(mix(0.82, 1, morph)) }}
          />
        </Card>

        {OPTIONS.map((name, i) => {
          const enter = tw(frame, 92 + i * 6, 124 + i * 6);
          const right = i === 1;
          const lit = right ? tw(frame, 176, 186) : 0;
          const dim = right ? 0 : tw(frame, 182, 198);
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: PILL.x,
                top: PILL.y + i * (PILL.h + PILL.gap),
                width: PILL.w,
                height: PILL.h,
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 32,
                background: interpolateColors(lit, [0, 1], [C.tile, C.proof]),
                color: interpolateColors(lit, [0, 1], [C.ink, "#FFFFFF"]),
                opacity: enter * (1 - dim * 0.65),
                translate: `${(1 - enter) * 60}px 0px`,
              }}
            >
              <Key k={"ABCD"[i]} light={right && lit > 0.5} />
              {right && lit > 0 && (
                <svg width={26} height={26} viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ scale: String(lit) }}>
                  <path d="M3 8.5l3.2 3L13 4.5" />
                </svg>
              )}
              {name}
            </div>
          );
        })}

        <Cursor keys={[{ f: 138, x: 1620, y: 930 }, { f: 172, x: 1540, y: PILL.y + PILL.h + PILL.gap + PILL.h / 2 }]} press={176} />
        <Stamp text="Correct" at={214} color={C.proof} size={36} style={{ left: 1110, top: 196 }} />
      </AbsoluteFill>
    </ModeScene>
  );
};
