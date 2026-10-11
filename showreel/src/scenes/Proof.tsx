import React from "react";
import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CropMarks, RegMark, Stamp } from "../components/Print";
import { Typewriter } from "../components/Type";
import { brand, logo } from "../data";
import { C, E, SANS, W, mix, monoLabel, shake, tw } from "../theme";

export const PROOF_FRAMES = 360;

const CARD = { x: 660, y: 100, w: 600, h: 820 };
const PLAYED = ["amul", "google", "swiggy", "netflix", "pepsi", "lego", "airtel", "ikea", "spotify", "tata"];
const MISS = 4;
const CALLOUTS = [
  { side: "left", y: 220, text: "Count-up score", at: 214 },
  { side: "left", y: 372, text: "Rank stamp · worn ink", at: 226 },
  { side: "right", y: 522, text: "Color bar · a chip per round", at: 238 },
  { side: "right", y: 680, text: "Every logo played", at: 250 },
] as const;

/** Results: the run as a press proof — the share card, assembling itself. */
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = tw(frame, 0, 32, E.inOut);
  const enter = tw(frame, 18, 60);
  const out = tw(frame, 312, 350, E.in);
  const score = Math.round(9 * tw(frame, 46, 104, E.out));
  const chipX = (i: number) => 76 + i * ((448 - 72) / 10 + 8);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: 1 - out,
          translate: `${shake(frame, 112, 14, 6)}px ${out * 40 + shake(frame, 112, 14, 3)}px`,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, opacity: enter, translate: `0px ${(1 - enter) * 70}px` }}>
          <CropMarks {...CARD} progress={tw(frame, 30, 70)} />
          <div
            style={{
              position: "absolute",
              left: CARD.x,
              top: CARD.y,
              width: CARD.w,
              height: CARD.h,
              background: C.card,
              borderRadius: 30,
              boxShadow: `0 0 0 1.5px ${C.rule}, 0 40px 80px -50px rgba(19,19,19,0.35)`,
            }}
          >
            <div style={{ position: "absolute", left: 44, top: 34, fontFamily: SANS, fontWeight: 900, fontSize: 34, fontVariationSettings: "'wdth' 125", letterSpacing: "-0.03em" }}>
              Brandr
            </div>
            <div style={{ position: "absolute", right: 44, top: 46, ...monoLabel(16) }}>Proof · 2026</div>
            <div style={{ position: "absolute", left: 44, right: 44, top: 96, height: 1.5, background: C.rule }} />
            <div
              style={{
                position: "absolute",
                left: 36,
                top: 112,
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 250,
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
                fontVariationSettings: "'wdth' 125",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {score}
              <span style={{ fontSize: 80, color: C.muted, fontWeight: 700, letterSpacing: "-0.02em" }}>/10</span>
            </div>
            <Stamp text="Art Director" at={112} color={C.proof} size={30} tilt={-4} style={{ left: 50, top: 352 }} />
            <div style={{ position: "absolute", left: 44, top: 444, fontFamily: SANS, fontSize: 27, color: C.muted, opacity: tw(frame, 130, 150) }}>
              A sharp eye. One or two slipped past.
            </div>

            <RegMark size={18} stroke={1.5} style={{ position: "absolute", left: 44, top: 513 }} />
            <RegMark size={18} stroke={1.5} style={{ position: "absolute", right: 44, top: 513 }} />
            {PLAYED.map((id, i) => {
              const at = 146 + i * 7;
              const ink = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 220 } });
              return (
                <div
                  key={id}
                  style={{
                    position: "absolute",
                    left: chipX(i),
                    top: 500,
                    width: (448 - 72) / 10,
                    height: 44,
                    borderRadius: 9,
                    overflow: "hidden",
                    background: i === MISS || frame < at ? C.rule : brand(id).colors[0].hex,
                    scale: i === MISS || frame < at ? "1" : `1 ${mix(0.2, 1, ink)}`,
                    transformOrigin: "bottom",
                  }}
                >
                  {i === MISS && frame >= at && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, background: C.flag }} />}
                </div>
              );
            })}

            {PLAYED.map((id, i) => {
              const pop = tw(frame, 176 + i * 5, 200 + i * 5, E.back);
              const miss = i === MISS;
              return (
                <div
                  key={id}
                  style={{
                    position: "absolute",
                    left: 42 + (i % 5) * 106,
                    top: 580 + Math.floor(i / 5) * 106,
                    width: 92,
                    height: 92,
                    borderRadius: 16,
                    background: C.card,
                    boxShadow: `0 0 0 1.5px ${C.rule}`,
                    scale: String(pop),
                  }}
                >
                  <Img src={logo(id)} style={{ width: 92, height: 92, borderRadius: 16, opacity: miss ? 0.35 : 1 }} />
                  <div
                    style={{
                      position: "absolute",
                      right: -6,
                      top: -6,
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background: miss ? C.flag : C.proof,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d={miss ? "M4 4l8 8M12 4l-8 8" : "M3 8.5l3.2 3L13 4.5"} />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spec callouts: leader lines draw out, labels type in. */}
        {CALLOUTS.map((c) => {
          const t = tw(frame, c.at, c.at + 22, E.out);
          const left = c.side === "left";
          const from = left ? CARD.x + 30 : CARD.x + CARD.w - 30;
          const len = 120;
          const y = CARD.y + c.y;
          return (
            <React.Fragment key={c.text}>
              <div style={{ position: "absolute", left: from - 5, top: y - 5, width: 10, height: 10, borderRadius: 5, background: C.ink, scale: String(t) }} />
              <div
                style={{
                  position: "absolute",
                  top: y - 0.75,
                  height: 1.5,
                  background: C.ink,
                  left: left ? from - len * t : from,
                  width: len * t,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: y - 12,
                  ...(left ? { right: W - (from - len - 16) } : { left: from + len + 16 }),
                  ...monoLabel(19, C.ink),
                }}
              >
                <Typewriter text={c.text} at={c.at + 14} cps={48} />
              </div>
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", top: CARD.y + CARD.h + 26, width: W, textAlign: "center" }}>
          <Typewriter text="Share card · 1080 × 1350 · drawn on canvas" at={262} cps={52} style={monoLabel(17)} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: C.ink, translate: `${reveal * W}px 0px` }} />
    </AbsoluteFill>
  );
};
