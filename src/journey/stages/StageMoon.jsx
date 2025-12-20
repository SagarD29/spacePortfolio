import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Moon Stage:
 * - Earth in the background with procedural geography + terminator + city lights (no images)
 * - Moon in foreground with procedural cratered surface (no images)
 * - Day/night computed from moon relative position (sun direction opposite moon)
 * - Moon orbits Earth (shared orbit params)
 */

const commonVertex = /* glsl */ `
varying vec3 vPosW;
varying vec3 vNormalW;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

// ---------- Utility noise (shared) ----------
const noiseLib = /* glsl */ `
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
  float a = 0.5;
  float f = 0.0;
  for (int i=0; i<5; i++) {
    f += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return f;
}

float ridged(vec3 p) {
  float n = 0.0;
  float a = 0.5;
  for (int i=0; i<4; i++) {
    float v = noise(p);
    v = 1.0 - abs(2.0*v - 1.0);
    n += a * v;
    p *= 2.1;
    a *= 0.55;
  }
  return n;
}

vec3 rotateY(vec3 p, float a) {
  float s = sin(a), c = cos(a);
  return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
}
`;

// ---------- Earth fragment ----------
const earthFrag = /* glsl */ `
precision highp float;
varying vec3 vPosW;
varying vec3 vNormalW;

uniform float uTime;
uniform vec3 uSunDir;
uniform float uSpin;
uniform float uCityBoost;

${noiseLib}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 Ns = rotateY(N, uSpin);

  float cont = fbm(Ns * 2.1);
  cont = mix(cont, fbm(Ns * 4.5), 0.35);

  float sea = 0.50;
  float landMask = smoothstep(sea, sea + 0.06, cont);

  float m = ridged(Ns * 8.0);
  m = pow(m, 2.2) * landMask;

  float lat = abs(Ns.y);
  float desertBand = smoothstep(0.10, 0.28, lat) * (1.0 - smoothstep(0.38, 0.55, lat));
  float desert = desertBand * landMask * smoothstep(0.45, 0.62, cont);

  float ice = smoothstep(0.62, 0.82, lat) * landMask;

  float oceanVar = fbm(Ns * 10.0);
  vec3 oceanDeep = vec3(0.01, 0.03, 0.08);
  vec3 oceanShallow = vec3(0.02, 0.08, 0.18);
  vec3 oceanCol = mix(oceanDeep, oceanShallow, oceanVar);

  vec3 landLow = vec3(0.05, 0.18, 0.08);
  vec3 landHigh = vec3(0.12, 0.10, 0.06);
  vec3 landCol = mix(landLow, landHigh, smoothstep(0.05, 0.75, m));
  landCol = mix(landCol, vec3(0.30, 0.25, 0.14), desert);
  landCol = mix(landCol, vec3(0.92, 0.95, 1.0), ice);

  float coast = smoothstep(sea - 0.02, sea + 0.02, cont) - smoothstep(sea + 0.02, sea + 0.06, cont);
  vec3 coastCol = vec3(0.10, 0.20, 0.18);

  vec3 albedo = mix(oceanCol, landCol, landMask);
  albedo = mix(albedo, coastCol, clamp(coast * 0.8, 0.0, 1.0));

  vec3 sunDir = normalize(uSunDir);
  float ndl = max(dot(N, sunDir), 0.0);
  float day = smoothstep(0.03, 0.25, ndl);
  float night = 1.0 - day;

  float city = fbm(Ns * 32.0);
  city = smoothstep(0.72, 0.88, city);
  float cityLat = smoothstep(0.05, 0.55, 1.0 - lat);
  float cityMask = city * landMask * cityLat * night;

  vec3 cityCol = vec3(1.0, 0.78, 0.35) * (0.9 + 0.2 * fbm(Ns * 55.0));
  vec3 emissive = cityCol * cityMask * (1.2 * uCityBoost);

  float oceanSpec = pow(max(dot(reflect(-sunDir, N), normalize(-vPosW)), 0.0), 18.0) * (1.0 - landMask);

  vec3 lit = albedo * (0.10 + 1.15 * day);
  lit += oceanSpec * vec3(0.35, 0.55, 0.65) * day;
  lit += emissive;

  lit = pow(lit, vec3(0.95));
  gl_FragColor = vec4(lit, 1.0);
}
`;

// ---------- Moon fragment ----------
const moonFrag = /* glsl */ `
precision highp float;
varying vec3 vPosW;
varying vec3 vNormalW;

uniform float uTime;
uniform vec3 uSunDir;
uniform float uSpin;

${noiseLib}

float craterField(vec3 p) {
  float c1 = 1.0 - abs(2.0*noise(p*18.0) - 1.0);
  float c2 = 1.0 - abs(2.0*noise(p*36.0) - 1.0);
  float c3 = 1.0 - abs(2.0*noise(p*72.0) - 1.0);
  float c = 0.55*c1 + 0.30*c2 + 0.15*c3;
  return pow(c, 2.4);
}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 Ns = rotateY(N, uSpin);

  float maria = fbm(Ns * 2.6);
  maria = smoothstep(0.40, 0.64, maria);

  float cr = craterField(Ns);
  float micro = fbm(Ns * 22.0);

  vec3 sunDir = normalize(uSunDir);
  float ndl = max(dot(N, sunDir), 0.0);
  float day = smoothstep(0.02, 0.22, ndl);

  vec3 highlands = vec3(0.26, 0.26, 0.30);
  vec3 mariaCol  = vec3(0.15, 0.15, 0.18);
  vec3 base = mix(highlands, mariaCol, maria);

  base *= 0.92 + 0.10 * micro;
  base *= 1.0 - 0.20 * cr;

  float rim = pow(1.0 - max(dot(N, normalize(-vPosW)), 0.0), 2.0);
  vec3 rimCol = vec3(0.55, 0.58, 0.65) * rim * 0.10;

  vec3 lit = base * (0.06 + 1.15 * day);
  lit += rimCol;
  lit = mix(lit, lit * vec3(0.72, 0.78, 0.90), 0.35 * (1.0 - day));

  gl_FragColor = vec4(lit, 1.0);
}
`;

function AtmosphereGlow({ radius, color = "#7aa2ff", opacity = 0.06, scale = 1.08 }) {
  const mat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [color, opacity]);

  return (
    <mesh scale={scale} material={mat}>
      <sphereGeometry args={[radius, 96, 96]} />
    </mesh>
  );
}

function MoonRimGlow({ radius }) {
  const mat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#cfd6ff"),
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh scale={1.10} material={mat}>
      <sphereGeometry args={[radius, 80, 80]} />
    </mesh>
  );
}

export default function StageMoon() {
  const earthGroup = useRef();
  const moonGroup = useRef();

  const MOON_ORBIT_R = 7.5;
  const MOON_ORBIT_Y = 0.6;
  const MOON_ORBIT_SPEED = 0.35;

  const earthMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: commonVertex,
      fragmentShader: earthFrag,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3(1, 0.2, 0.4).normalize() },
        uSpin: { value: 0 },
        uCityBoost: { value: 1.0 },
      },
    });
  }, []);

  const moonMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: commonVertex,
      fragmentShader: moonFrag,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3(1, 0.2, 0.4).normalize() },
        uSpin: { value: 0 },
      },
    });
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    const a = t * MOON_ORBIT_SPEED;
    const moonPos = new THREE.Vector3(Math.cos(a) * MOON_ORBIT_R, MOON_ORBIT_Y, Math.sin(a) * MOON_ORBIT_R);

    if (moonGroup.current) {
      moonGroup.current.position.copy(moonPos);
      moonGroup.current.rotation.y += dt * 0.16;
    }

    if (earthGroup.current) {
      earthGroup.current.rotation.y += dt * 0.06;
    }

    const sunDir = moonPos.clone().normalize().multiplyScalar(-1);

    earthMat.uniforms.uTime.value = t;
    earthMat.uniforms.uSunDir.value.copy(sunDir);
    earthMat.uniforms.uSpin.value = t * 0.02;
    earthMat.uniforms.uCityBoost.value = 1.0;

    moonMat.uniforms.uTime.value = t;
    moonMat.uniforms.uSunDir.value.copy(sunDir);
    moonMat.uniforms.uSpin.value = t * 0.01;
  });

  return (
    <group>
      {/* EARTH (background) */}
      <group ref={earthGroup} position={[0, 0, 0]}>
        <mesh material={earthMat}>
          <sphereGeometry args={[2.7, 128, 128]} />
        </mesh>
        <AtmosphereGlow radius={2.7} opacity={0.07} scale={1.085} />
      </group>

      {/* MOON (foreground) */}
      <group ref={moonGroup}>
        <mesh material={moonMat}>
          <sphereGeometry args={[1.1, 128, 128]} />
        </mesh>
        <MoonRimGlow radius={1.1} />
      </group>
    </group>
  );
}
