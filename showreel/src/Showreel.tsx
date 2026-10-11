import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Frame } from "./components/Frame";
import { MODE_FRAMES } from "./components/Mode";
import { Draw } from "./scenes/Draw";
import { Fake } from "./scenes/Fake";
import { Focus } from "./scenes/Focus";
import { Outro, OUTRO_FRAMES } from "./scenes/Outro";
import { Palette } from "./scenes/Palette";
import { Premise, PREMISE_FRAMES } from "./scenes/Premise";
import { Proof, PROOF_FRAMES } from "./scenes/Proof";
import { Registration, REGISTRATION_FRAMES } from "./scenes/Registration";
import { Shade } from "./scenes/Shade";
import { Tests, TESTS_FRAMES } from "./scenes/Tests";
import { Title, TITLE_FRAMES } from "./scenes/Title";
import { C } from "./theme";

/** The run order. Each scene owns its in/out; the Frame spans them all. */
export const SCENES = [
  { name: "Registration", frames: REGISTRATION_FRAMES, Scene: Registration },
  { name: "Title", frames: TITLE_FRAMES, Scene: Title },
  { name: "Premise", frames: PREMISE_FRAMES, Scene: Premise },
  { name: "Five tests", frames: TESTS_FRAMES, Scene: Tests },
  { name: "Palette", frames: MODE_FRAMES, Scene: Palette },
  { name: "Exact shade", frames: MODE_FRAMES, Scene: Shade },
  { name: "Real or fake", frames: MODE_FRAMES, Scene: Fake },
  { name: "Draw", frames: MODE_FRAMES, Scene: Draw },
  { name: "Focus", frames: MODE_FRAMES, Scene: Focus },
  { name: "Proof", frames: PROOF_FRAMES, Scene: Proof },
  { name: "Press OK", frames: OUTRO_FRAMES, Scene: Outro },
];
export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Series>
      {SCENES.map(({ name, frames, Scene }) => (
        <Series.Sequence key={name} name={name} durationInFrames={frames}>
          <Scene />
        </Series.Sequence>
      ))}
    </Series>
    <Frame scenes={SCENES} />
  </AbsoluteFill>
);
