import { ScrollControls, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import JourneyScene from "./JourneyScene";
import "./journey.css";

export default function JourneyPage() {
  const pages = useMemo(() => 10, []);

  return (
    <main className="journeyRoot">
      {/* HUD OUTSIDE Canvas */}
      <div className="journeyHud">
        <Link className="hudHome" to="/">
          Home
        </Link>
        <Link className="hudArchive" to="/archive">
          Archive
        </Link>
      </div>

      <Canvas
        className="journeyCanvas"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 52, near: 0.1, far: 8000, position: [0, 1, 14] }}
      >
        <color attach="background" args={["#05050b"]} />

        <Suspense fallback={null}>
          {/* IMPORTANT: no <Scroll> wrapper for the 3D scene */}
          <ScrollControls pages={pages} damping={0.12}>
            <JourneyScene />
          </ScrollControls>

          <Preload all />
        </Suspense>
      </Canvas>
    </main>
  );
}
