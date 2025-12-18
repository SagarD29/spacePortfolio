import { useInRouterContext } from "react-router-dom";

export default function RouterProbe() {
  const inRouter = useInRouterContext();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        padding: "8px 10px",
        borderRadius: 12,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        fontSize: 12,
      }}
    >
      RouterContext: {String(inRouter)}
    </div>
  );
}
