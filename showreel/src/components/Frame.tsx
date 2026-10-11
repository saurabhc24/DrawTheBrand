import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHIPS, CHIP_COLORS } from "../data";
import { C, E, H, W, mix, monoLabel, tw } from "../theme";
import { CropMarks, RegMark } from "./Print";
import { STRIP_BAR, STRIP_TITLE, chipRect, lerpGeom } from "./Strip";
import { Typewriter } from "./Type";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The press sheet every scene is printed on, on the reel's global clock:
 * crop marks that fly out of the opening registration mark (and back into the
 * closing one), slug lines with a sheet counter and running timecode, and the
 * progress strip — the game's color bar — inking a chip at a time.
 */
export const Frame: React.FC<{ scenes: { name: string; frames: number }[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: T } = useVideoConfig();
  const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((s, x) => s + x.frames, 0));
  const scene = starts.filter((s) => s <= frame).length - 1;
  const inkFrom = starts[2];
  const outro = starts[scenes.length - 1];

  // Trim marks: born at the center, flown to the sheet corners; home at the end.
  const p = tw(frame, 100, 150, E.out) * (1 - tw(frame, T - 98, T - 58, E.inOut));
  const slugs = 1 - tw(frame, T - 120, T - 96, E.in);
  const sec = Math.floor(frame / fps);

  // Progress strip: bar geometry, rising to the title strip for the outro.
  const rise = tw(frame, outro, outro + 64, E.inOut);
  const collapse = tw(frame, T - 110, T - 64, E.inOut);
  const geom = lerpGeom(STRIP_BAR, STRIP_TITLE, rise);
  const regSize = mix(16, 30, rise);
  const regY = geom.y + geom.h / 2 - regSize / 2;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {frame >= 100 && p > 0.002 && (
        <CropMarks x={mix(W / 2, 64, p)} y={mix(H / 2, 64, p)} w={(W - 128) * p} h={(H - 128) * p} progress={p} gap={10} len={30} />
      )}
      {[24, W - 50].map((x) => (
        <RegMark
          key={x}
          size={26}
          progress={tw(frame, 130, 170, E.inOut)}
          stroke={1.4}
          style={{ position: "absolute", left: x, top: H / 2 - 13, opacity: 1 - tw(frame, T - 110, T - 90) }}
        />
      ))}

      <div style={{ position: "absolute", left: 104, top: 26, opacity: slugs, ...monoLabel(15) }}>
        <Typewriter text="A brand memory test" at={140} cps={36} />
      </div>
      <div style={{ position: "absolute", right: 104, top: 26, opacity: tw(frame, 160, 180) * slugs, ...monoLabel(15) }}>
        {pad(scene + 1)} / {pad(scenes.length)} · {scenes[scene].name}
      </div>
      <div style={{ position: "absolute", left: 104, bottom: 24, opacity: slugs, ...monoLabel(15) }}>
        <Typewriter text="Brandr — showreel 2026" at={150} cps={36} />
      </div>
      <div style={{ position: "absolute", right: 104, bottom: 24, opacity: tw(frame, 160, 180) * slugs, fontVariantNumeric: "tabular-nums", ...monoLabel(15) }}>
        {pad(Math.floor(sec / 60))}:{pad(sec % 60)}:{pad(frame % fps)}
      </div>

      {frame >= inkFrom && collapse < 1 && (
        <>
          {Array.from({ length: CHIPS }, (_, i) => {
            const at = inkFrom + ((i + 1) / CHIPS) * (outro - inkFrom);
            const inked = frame >= at;
            const ink = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 200 } });
            const r = chipRect(geom, i);
            const k = 1 - collapse;
            const cx = mix(r.x + r.w / 2, W / 2, collapse);
            const cy = mix(r.y + r.h / 2, H / 2, collapse);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: cx - (r.w * k) / 2,
                  top: cy - (r.h * k) / 2,
                  width: r.w * k,
                  height: r.h * k,
                  borderRadius: r.h / 2,
                  background: inked ? CHIP_COLORS[i] : C.rule,
                  scale: inked ? `1 ${mix(0.2, 1, ink)}` : "1",
                }}
              />
            );
          })}
          {[geom.x - 22 - regSize, geom.x + geom.w + 22].map((x, i) => (
            <RegMark key={i} size={regSize} stroke={1.6} style={{ position: "absolute", left: x, top: regY, opacity: 1 - tw(frame, T - 112, T - 96) }} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
