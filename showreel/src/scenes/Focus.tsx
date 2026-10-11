import React from "react";
import { AbsoluteFill, Img, interpolateColors, useCurrentFrame } from "remotion";
import { Cursor, Key, ModeScene } from "../components/Mode";
import { Stamp } from "../components/Print";
import { logo } from "../data";
import { C, E, MONO, SANS, tw } from "../theme";

const CARD = { x: 1090, y: 120, s: 420 };
const OPTIONS = ["Spotify", "Starbucks", "WhatsApp", "Android"]; // all green: shape has to decide it
const PILL = { y: 600, w: 196, h: 74, gap: 14 };
const pillX = (i: number) => 1300 - (4 * PILL.w + 3 * PILL.gap) / 2 + i * (PILL.w + PILL.gap);
const TAP = 166;

/** Mode E — the logo pulls into focus; call it early for more points. */
export const Focus: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = tw(frame, 38, 200, E.linear);
  const snap = tw(frame, TAP + 2, TAP + 16, E.out);
  const blur = 40 * (1 - pull) ** 1.6 * (1 - snap);
  const lock = tw(frame, TAP, TAP + 10, E.back);
  const hunt = (1 - lock) * Math.abs(Math.sin(frame / 7)) * 0.07;
  const points = Math.round(100 - 28 * tw(frame, 38, TAP, E.linear));
  const bracket = interpolateColors(lock, [0, 1], ["rgba(19,19,19,0.45)", C.proof]);
  return (
    <ModeScene color={C.olive} letter="E" name="Focus" blurb="Call the logo before it sharpens." next={C.ink} isNew>
      <AbsoluteFill>
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.s, height: CARD.s, opacity: tw(frame, 30, 50) }}>
          <div style={{ position: "absolute", inset: 0, background: C.card, borderRadius: 24, boxShadow: `0 0 0 1.5px ${C.rule}`, overflow: "hidden" }}>
            <Img src={logo("starbucks")} style={{ width: CARD.s, height: CARD.s, filter: `blur(${blur}px)`, scale: String(1 + blur / 300) }} />
          </div>
          {/* Autofocus brackets: hunting, then locking on at the tap. */}
          <svg
            viewBox="0 0 64 64"
            width={CARD.s + 70}
            height={CARD.s + 70}
            fill="none"
            stroke={bracket}
            strokeWidth={0.62}
            strokeLinecap="round"
            style={{ position: "absolute", left: -35, top: -35, scale: String(1 + hunt + (1 - tw(frame, 30, 60)) * 0.2) }}
          >
            <path d="M2 12V2h10M52 2h10v10M62 52v10H52M12 62H2V52" />
          </svg>
        </div>

        <div style={{ position: "absolute", left: CARD.x + CARD.s + 60, top: CARD.y + 120, opacity: tw(frame, 40, 60) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 500, letterSpacing: "0.16em", color: C.muted }}>POINTS</div>
          <div
            style={{
              marginTop: 8,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 92,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              fontVariationSettings: "'wdth' 125",
              color: interpolateColors(lock, [0, 1], [C.ink, C.proof]),
            }}
          >
            +{points}
          </div>
          <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 17, letterSpacing: "0.14em", color: C.muted, opacity: 1 - lock }}>
            {`BLUR ${blur.toFixed(0).padStart(2, "0")}PX`}
          </div>
        </div>

        {OPTIONS.map((name, i) => {
          const right = i === 1;
          const lit = right ? tw(frame, TAP, TAP + 10) : 0;
          const enter = tw(frame, 60 + i * 5, 90 + i * 5);
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: pillX(i),
                top: PILL.y,
                width: PILL.w,
                height: PILL.h,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 26,
                background: interpolateColors(lit, [0, 1], [C.tile, C.proof]),
                color: interpolateColors(lit, [0, 1], [C.ink, "#FFFFFF"]),
                opacity: enter * (right ? 1 : 1 - tw(frame, TAP + 4, TAP + 18) * 0.65),
                translate: `0px ${(1 - enter) * 40}px`,
              }}
            >
              <Key k={"ABCD"[i]} light={right && lit > 0.5} />
              {name}
            </div>
          );
        })}

        <Cursor keys={[{ f: 132, x: 1560, y: 940 }, { f: TAP - 4, x: pillX(1) + PILL.w / 2, y: PILL.y + PILL.h / 2 }]} press={TAP} />
        <Stamp text={`+${points} pts`} at={TAP + 16} color={C.proof} size={34} style={{ left: CARD.x + 270, top: CARD.y - 46 }} />
      </AbsoluteFill>
    </ModeScene>
  );
};
