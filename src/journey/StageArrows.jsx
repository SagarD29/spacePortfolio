// src/journey/StageArrows.jsx
import React from "react";

export default function StageArrows({ onPrev, onNext }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 18,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={onPrev}
        aria-label="Previous stage"
        style={btnStyle}
      >
        ↑
      </button>
      <button
        onClick={onNext}
        aria-label="Next stage"
        style={btnStyle}
      >
        ↓
      </button>
    </div>
  );
}

const btnStyle = {
  width: 44,
  height: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(0,0,0,0.45)",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};
