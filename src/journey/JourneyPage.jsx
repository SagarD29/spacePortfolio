// src/journey/JourneyPage.jsx
import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import JourneyScene from "./JourneyScene";
import StageArrows from "./StageArrows";
import { STAGE_COUNT } from "./stages/stages";
import StepScrollController from "./StepScrollController";

export default function JourneyPage() {
  const stepRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard support: stage stepping
  useEffect(() => {
    const isTypingTarget = (el) => {
      if (!el) {return false;}
      const tag = el.tagName?.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      );
    };

    const onKeyDown = (e) => {
      if (isTypingTarget(document.activeElement)) {return;}
      if (e.metaKey || e.ctrlKey || e.altKey) {return;}

      const k = e.key;

      const prevKeys = ["ArrowUp", "PageUp", "w", "W"];
      const nextKeys = ["ArrowDown", "PageDown", "s", "S", " "];

      if (prevKeys.includes(k)) {
        e.preventDefault();
        stepRef.current?.prev?.();
        return;
      }

      if (nextKeys.includes(k)) {
        e.preventDefault();
        stepRef.current?.next?.();
        return;
      }

      // Optional: jump
      if (k === "Home") {
        e.preventDefault();
        stepRef.current?.goTo?.(0);
        return;
      }

      if (k === "End") {
        e.preventDefault();
        stepRef.current?.goTo?.(STAGE_COUNT - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      {/* Home + Archive buttons (kept here, no separate nav file) */}
      <div
        style={{
          position: "fixed",
          left: 18,
          top: 18,
          zIndex: 70,
          display: "flex",
          gap: 10,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={navBtnStyle}
          aria-label="Go to Home"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/archive")}
          style={navBtnStyle}
          aria-label="Go to Archive"
        >
          Archive
        </button>
      </div>

      {/* Stage arrows */}
      <StageArrows
        onPrev={() => stepRef.current?.prev?.()}
        onNext={() => stepRef.current?.next?.()}
      />

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ScrollControls pages={STAGE_COUNT} damping={0.08}>
          <StepScrollController
            ref={stepRef}
            stageCount={STAGE_COUNT}
            gestureWindowMs={120}
            gestureThreshold={45}
            maxQueuedSteps={1}
            stepDurationMs={420}
          />
          <JourneyScene />
        </ScrollControls>
      </Canvas>
    </div>
  );
}

const navBtnStyle = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(0,0,0,0.45)",
  color: "white",
  fontSize: 14,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};
