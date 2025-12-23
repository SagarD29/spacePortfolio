// src/journey/JourneyPage.jsx
import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import JourneyScene from "./JourneyScene";
import StageArrows from "./StageArrows";
import { STAGE_COUNT } from "./stages/stages";
import StepScrollController from "./StepScrollController";

export default function JourneyPage() {
  const stepRef = useRef(null);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        background: "black",
      }}
    >
      {/* Overlay arrows */}
      <StageArrows
        onPrev={() => stepRef.current?.prev?.()}
        onNext={() => stepRef.current?.next?.()}
      />

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ScrollControls pages={STAGE_COUNT} damping={0.08}>
          <StepScrollController
            ref={stepRef}
            stageCount={STAGE_COUNT}
            // tuned for “easy to scroll one stage at a time”
            gestureWindowMs={120}
            gestureThreshold={55}
            maxQueuedSteps={2}
            stepDurationMs={520}
          />
          <JourneyScene />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
