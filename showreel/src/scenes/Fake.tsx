import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Cursor, ModeScene } from "../components/Mode";
import { CropMarks, Stamp } from "../components/Print";
import { logo } from "../data";
import { C, E, MONO, mix, tw } from "../theme";

const SIZE = 420;
const X = 1300 - SIZE / 2;
const Y = 150;

/** A proof card holding the logo; `doctored` 0→1 squeezes it and shifts its hue. */
const Proof: React.FC<{ doctored: number; caption?: string; tone?: string; captionIn?: number }> = ({
  doctored,
  caption,
  tone = C.muted,
  captionIn = 0,
}) => (
  <div style={{ position: "relative", width: SIZE, height: SIZE }}>
    <div style={{ position: "absolute", inset: 0, background: C.card, borderRadius: 24, boxShadow: `0 0 0 ${tone === C.flag ? 3 : 1.5}px ${tone === C.flag ? C.flag : C.rule}`, overflow: "hidden" }}>
      <Img
        src={logo("spotify")}
        style={{ width: SIZE, height: SIZE, scale: `${1 - 0.2 * doctored} 1`, filter: `hue-rotate(${-58 * doctored}deg)` }}
      />
    </div>
    {caption && (
      <div style={{ position: "absolute", top: SIZE + 22, width: "100%", textAlign: "center", fontFamily: MONO, fontSize: 20, fontWeight: 600, letterSpacing: "0.16em", color: tone, opacity: captionIn }}>
        {caption}
      </div>
    )}
  </div>
);

/** Mode C — real or fake: one logo, one call. */
export const Fake: React.FC = () => {
  const frame = useCurrentFrame();
  // Glitchy flicker between real and doctored, settling doctored.
  const doctored = Math.min(
    1,
    Math.max(0, tw(frame, 68, 73) - tw(frame, 82, 87) + tw(frame, 98, 102) - tw(frame, 108, 112) + tw(frame, 122, 132)),
  );
  const compare = tw(frame, 226, 268, E.inOut);
  const buttonsIn = tw(frame, 138, 166) * (1 - tw(frame, 216, 232, E.in));
  return (
    <ModeScene color={C.yellow} letter="C" name="Real or fake" blurb="Half of these logos are quietly doctored." next={C.green}>
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: X,
            top: Y,
            opacity: tw(frame, 30, 50),
            translate: `${-250 * compare}px ${30 * compare}px`,
            scale: String(mix(1, 0.8, compare)),
          }}
        >
          <CropMarks x={0} y={0} w={SIZE} h={SIZE} progress={tw(frame, 30, 60) * (1 - compare)} />
          <Proof doctored={doctored} caption="What you saw" tone={C.flag} captionIn={tw(frame, 252, 272)} />
          <Stamp text="Fake" at={204} color={C.flag} size={46} tilt={-8} style={{ left: 250, top: -26 }} />
        </div>

        <div
          style={{
            position: "absolute",
            left: X,
            top: Y,
            opacity: compare,
            translate: `${mix(500, 250, compare)}px ${30 * compare}px`,
            scale: String(mix(1, 0.8, compare)),
          }}
        >
          <Proof doctored={0} caption="The real one" captionIn={tw(frame, 258, 278)} />
        </div>

        {[
          { label: "Real", fill: C.proof, x: 1090 },
          { label: "Fake", fill: C.flag, x: 1310 },
        ].map((b) => {
          const picked = b.label === "Fake";
          const verdict = tw(frame, 196, 204);
          return (
            <div
              key={b.label}
              style={{
                position: "absolute",
                left: b.x,
                top: 620,
                width: 200,
                height: 86,
                borderRadius: 24,
                background: b.fill,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: MONO,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: "0.18em",
                opacity: buttonsIn * (picked ? 1 : 1 - verdict * 0.7),
                translate: `0px ${(1 - tw(frame, 138, 166)) * 40}px`,
              }}
            >
              {picked && verdict > 0 && (
                <svg width={24} height={24} viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ scale: String(verdict) }}>
                  <path d="M3 8.5l3.2 3L13 4.5" />
                </svg>
              )}
              {b.label.toUpperCase()}
            </div>
          );
        })}

        <Cursor keys={[{ f: 160, x: 1560, y: 930 }, { f: 190, x: 1410, y: 663 }]} press={194} />
      </AbsoluteFill>
    </ModeScene>
  );
};
