import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { SCENES, Showreel, TOTAL_FRAMES } from "./Showreel";
import { C, FPS, H, W } from "./theme";

/** Each scene on paper, for previewing on its own timeline. */
const onPaper = (Scene: React.FC) => {
  const Wrapped: React.FC = () => (
    <AbsoluteFill style={{ background: C.paper }}>
      <Scene />
    </AbsoluteFill>
  );
  return Wrapped;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Folder name="Scenes">
      {SCENES.map(({ name, frames, Scene }) => (
        <Composition
          key={name}
          id={name.replace(/[^A-Za-z]/g, "")}
          component={onPaper(Scene)}
          durationInFrames={frames}
          fps={FPS}
          width={W}
          height={H}
        />
      ))}
    </Folder>
  </>
);
