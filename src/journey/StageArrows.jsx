// src/journey/StageArrows.jsx
export default function StageArrows({ onPrev, onNext }) {
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <button onClick={onPrev} aria-label="Previous stage" style={btnStyle}>
        ↑
      </button>
      <button onClick={onNext} aria-label="Next stage" style={btnStyle}>
        ↓
      </button>
    </div>
  );
}

const btnStyle = {
  width: 44,
  height: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.5)",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};
