import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Gas + Dust Cloud (no images)
 * - Layered volumetric slices (multiple planes) = fast "3D fog"
 * - Procedural nebula shader:
 *   - filaments (ridged noise)
 *   - core glow
 *   - star specks
 *   - animated flow
 * - Additive-ish blending for cinematic glow
 */

const nebulaVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosW;

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const nebulaFrag = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosW;

uniform float uTime;
uniform float uSlice;     // 0..1 per plane
uniform float uDensity;   // global density
uniform float uGlow;      // glow strength

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash(i + vec3(0,0,0));
  float n100 = hash(i + vec3(1,0,0));
  float n010 = hash(i + vec3(0,1,0));
  float n110 = hash(i + vec3(1,1,0));
  float n001 = hash(i + vec3(0,0,1));
  float n101 = hash(i + vec3(1,0,1));
  float n011 = hash(i + vec3(0,1,1));
  float n111 = hash(i + vec3(1,1,1));

  float n00 = mix(n000, n100, f.x);
  float n10 = mix(n010, n110, f.x);
  float n01 = mix(n001, n101, f.x);
  float n11 = mix(n011, n111, f.x);

  float n0 = mix(n00, n10, f.y);
  float n1 = mix(n01, n11, f.y);

  return mix(n0, n1, f.z);
}

float fbm(vec3 p) {
  float a = 0.55;
  float f = 0.0;
  for (int i=0; i<6; i++) {
    f += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return f;
}

float ridged(vec3 p) {
  float a = 0.55;
  float f = 0.0;
  for (int i=0; i<5; i++) {
    float n = noise(p);
    n = 1.0 - abs(2.0*n - 1.0);
    f += a * n;
    p *= 2.1;
    a *= 0.55;
  }
  return f;
}

float starField(vec2 uv) {
  // cheap sparse stars
  vec2 g = floor(uv * 220.0);
  vec2 f = fract(uv * 220.0);
  float h = fract(sin(dot(g, vec2(127.1, 311.7))) * 43758.5453);
  float s = step(0.996, h); // very rare
  float d = length(f - 0.5);
  return s * smoothstep(0.18, 0.0, d);
}

void main() {
  // center-ish coords
  vec2 uv = vUv * 2.0 - 1.0;

  // depth through the volume using slice
  float z = (uSlice - 0.5) * 2.2;

  // animated flow direction
  float t = uTime * 0.04;

  // 3D noise domain
  vec3 P = vec3(uv * 1.8, z) + vec3(0.0, 0.0, t * 2.0);

  // broad nebula mass + filament detail
  float mass = fbm(P * 0.7);
  float fil  = ridged(P * 1.6);
  float dust = fbm(P * 2.2);

  // shape it: softer edges, denser center
  float r = length(uv);
  float vign = smoothstep(1.15, 0.15, r);

  // core glow cluster
  float core = pow(smoothstep(0.55, 0.95, fbm(P * 0.9 + vec3(0.0, 0.0, -0.4))), 2.2);
  core *= smoothstep(0.85, 0.05, r);

  // density field
  float d = 0.0;
  d += 0.65 * smoothstep(0.35, 0.95, mass);
  d += 0.55 * smoothstep(0.45, 0.98, fil);
  d += 0.35 * smoothstep(0.35, 0.95, dust);
  d *= vign;

  // make thin wisps
  d = pow(d, 1.25);

  // color palette: Orion-ish magenta/orange/teal
  vec3 c1 = vec3(0.95, 0.35, 0.65); // magenta
  vec3 c2 = vec3(0.92, 0.62, 0.28); // orange
  vec3 c3 = vec3(0.25, 0.65, 0.75); // teal
  vec3 c4 = vec3(0.80, 0.90, 1.00); // pale core

  // color mixing by noise bands
  float band = fbm(P * 1.0 + vec3(0.0, 0.0, 1.7));
  vec3 col = mix(c1, c2, smoothstep(0.25, 0.75, band));
  col = mix(col, c3, smoothstep(0.55, 0.95, fil));
  col = mix(col, c4, core);

  // stars through the cloud (faint)
  float stars = starField(vUv + vec2(z * 0.02, 0.0));

  // alpha per slice (thicker in the middle)
  float sliceFade = smoothstep(1.0, 0.0, abs(z));
  float alpha = d * sliceFade * uDensity;

  // glow is stronger where core + density is high
  float glow = (core * 1.3 + d * 0.35) * uGlow;

  vec3 outCol = col * (0.65 + glow);
  outCol += vec3(1.0) * stars * 0.65;

  // soften edges
  outCol *= vign;

  // IMPORTANT: premultiplied-ish output helps additive blending feel
  gl_FragColor = vec4(outCol * alpha, alpha);
}
`;

function NebulaSlice({ z, size = 40, mat, slice }) {
  return (
    <mesh position={[0, 0, z]} material={mat}>
      <planeGeometry args={[size, size, 1, 1]} />
    </mesh>
  );
}

export default function StageGasCloud() {
  const group = useRef();

  const SLICES = 32; // increase for more “volume” (cost increases)
  const DEPTH = 18;

  const baseMat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      vertexShader: nebulaVertex,
      fragmentShader: nebulaFrag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSlice: { value: 0 },
        uDensity: { value: 0.55 },
        uGlow: { value: 1.15 },
      },
    });
    return m;
  }, []);

  const sliceMats = useMemo(() => {
    const arr = [];
    for (let i = 0; i < SLICES; i++) {
      const m = baseMat.clone();
      m.uniforms = THREE.UniformsUtils.clone(baseMat.uniforms);
      m.uniforms.uSlice.value = i / (SLICES - 1);
      arr.push(m);
    }
    return arr;
  }, [baseMat, SLICES]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < sliceMats.length; i++) {
      sliceMats[i].uniforms.uTime.value = t;
    }

    // subtle drift/rotation so it feels alive
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.06) * 0.05;
      group.current.rotation.y = Math.sin(t * 0.04) * 0.06;
    }
  });

  return (
    <group ref={group} position={[0, 0, -20]}>
      {Array.from({ length: SLICES }).map((_, i) => {
        const a = i / (SLICES - 1);
        const z = (a - 0.5) * DEPTH;
        return <NebulaSlice key={i} z={z} mat={sliceMats[i]} slice={a} />;
      })}
    </group>
  );
}
