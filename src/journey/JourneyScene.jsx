import { Environment, Stars, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import StageRenderer from "./stages/StageRenderer";
import { STAGES, STAGE_COUNT } from "./stages/stages";
import { remap, smooth01, damp, lerp } from "./utils/r3fUtils";

export default function JourneyScene() {
  const navigate = useNavigate();
  const scroll = useScroll();

  const bloomRef = useRef();
  const caRef = useRef();

  const headLight = useRef();
  const focusLight = useRef();

  const camState = useRef({
    cam: STAGES[0].cam.pos.clone(),
    look: STAGES[0].cam.look.clone(),
    fov: STAGES[0].cam.fov,
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  const stageKeys = useMemo(() => STAGES.map((s) => s.key), []);

  // --- EVENT HORIZON ---
  const BLACK_HOLE_INDEX = useMemo(() => STAGES.findIndex((s) => s.key === "blackhole"), []);
  const hasCrossedHorizon = useRef(false);

  // Shared orbit params (must match StageEarth + StageMoon)
  const MOON_ORBIT_R = 7.5;
  const MOON_ORBIT_Y = 0.6;
  const MOON_ORBIT_SPEED = 0.35;

  useFrame((r3f, dt) => {
    const t = scroll.offset; // 0..1

    const u = t * STAGE_COUNT;
    const idx = Math.max(0, Math.min(STAGE_COUNT - 1, Math.floor(u)));
    const local = u - idx; // 0..1 inside stage

    // stage switching (state updates only when idx changes)
    if (idx !== activeIdxRef.current) {
      activeIdxRef.current = idx;
      setActiveIdx(idx);
    }

    // ✅ EVENT HORIZON: if user scrolls past black hole stage, redirect once
    if (BLACK_HOLE_INDEX >= 0 && idx > BLACK_HOLE_INDEX && !hasCrossedHorizon.current) {
      hasCrossedHorizon.current = true;
      setTimeout(() => navigate("/archive"), 350);
    }

    const stage = STAGES[idx];
    const nextStage = STAGES[Math.min(idx + 1, STAGE_COUNT - 1)];

    const stageKey = stage.key;
    const nextKey = nextStage.key;

    // Live moon orbit position (used for camera targeting)
    const time = r3f.clock.elapsedTime;
    const a = time * MOON_ORBIT_SPEED;
    const moonPos = new THREE.Vector3(Math.cos(a) * MOON_ORBIT_R, MOON_ORBIT_Y, Math.sin(a) * MOON_ORBIT_R);

    // Helper: stage camera, but dynamically override for Moon focus
    const getCamForKey = (key, baseCam) => {
      // Default: use configured stage camera
      let pos = baseCam.pos.clone();
      let look = baseCam.look.clone();
      let fov = baseCam.fov;

      // Moon stage: keep moon in focus, earth in background
      if (key === "moon") {
        look = moonPos.clone();
        pos = moonPos.clone().add(new THREE.Vector3(0.6, 0.7, 4.2)); // camera offset around moon
        fov = 50;
      }

      return { pos, look, fov };
    };

    const camA = getCamForKey(stageKey, stage.cam);
    const camB = getCamForKey(nextKey, nextStage.cam);

    // blend only near the end of the current stage
    const lead = smooth01(remap(local, 0.78, 1.0));

    const targetPos = camA.pos.clone().lerp(camB.pos, lead);
    const targetLook = camA.look.clone().lerp(camB.look, lead);
    const targetFov = lerp(camA.fov, camB.fov, lead);

    // zip-feel on these transitions
    const isZip = stageKey === "sun" || stageKey === "asteroids" || stageKey === "gas" || stageKey === "supernova";

    if (isZip && lead > 0) {
      const shake = 0.22 * (1 - lead);
      targetPos.x += Math.sin(time * 44) * shake;
      targetPos.y += Math.cos(time * 31) * shake;
    }

    // smooth camera movement
    camState.current.cam.x = damp(camState.current.cam.x, targetPos.x, 4.2, dt);
    camState.current.cam.y = damp(camState.current.cam.y, targetPos.y, 4.2, dt);
    camState.current.cam.z = damp(camState.current.cam.z, targetPos.z, 4.2, dt);

    camState.current.look.x = damp(camState.current.look.x, targetLook.x, 5.0, dt);
    camState.current.look.y = damp(camState.current.look.y, targetLook.y, 5.0, dt);
    camState.current.look.z = damp(camState.current.look.z, targetLook.z, 5.0, dt);

    camState.current.fov = damp(camState.current.fov, targetFov, 3.0, dt);
    r3f.camera.fov = camState.current.fov;
    r3f.camera.updateProjectionMatrix();

    r3f.camera.position.copy(camState.current.cam);
    r3f.camera.lookAt(camState.current.look);

    // lights that always illuminate the subject
    if (headLight.current) {
      headLight.current.position.copy(r3f.camera.position);
      headLight.current.intensity = 18;
      headLight.current.distance = 2500;
      headLight.current.decay = 1.2;
    }
    if (focusLight.current) {
      focusLight.current.position.set(
        camState.current.look.x + 6,
        camState.current.look.y + 6,
        camState.current.look.z + 10
      );
      focusLight.current.intensity = 12;
      focusLight.current.distance = 2500;
      focusLight.current.decay = 1.3;
    }

    // post effects (stable)
    if (bloomRef.current) {
      const base = 0.55;
      const punch = isZip ? 0.85 : stageKey === "inside" ? 1.1 : 0.25;
      bloomRef.current.intensity = base + punch * (isZip ? (1 - lead) : 1);
    }
    if (caRef.current) {
      const base = 0.00012;
      const punch = isZip ? 0.0011 : stageKey === "inside" ? 0.0017 : 0.00035;
      const amt = base + punch * (isZip ? (1 - lead) : 1);
      caRef.current.offset.set(amt, amt);
    }
  });

  const activeKey = stageKeys[activeIdx];

  const onEnterArchive = () => {
    navigate("/archive");
  };

  return (
    <>
      <Environment preset="night" />
      <Stars radius={1800} depth={1200} count={10000} factor={4} saturation={0} fade speed={0.25} />

      {/* Only one stage renders at a time */}
      <StageRenderer stageKey={activeKey} onEnterArchive={onEnterArchive} />

      <ambientLight intensity={0.28} />
      <pointLight ref={headLight} color="#ffffff" />
      <pointLight ref={focusLight} color="#b8c8ff" />
      <pointLight position={[0, 0, 0]} intensity={10} color="#ffd36e" distance={2500} decay={1.1} />

      <EffectComposer multisampling={0}>
        <Bloom ref={bloomRef} luminanceThreshold={0.35} intensity={0.65} />
        <ChromaticAberration ref={caRef} offset={new THREE.Vector2(0.00012, 0.00012)} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    </>
  );
}
