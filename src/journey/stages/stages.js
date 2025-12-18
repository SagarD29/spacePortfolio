import { v3 } from "../utils/r3fUtils";

export const STAGES = [
  { key: "earth", cam: { pos: v3(0, 1.6, 14), look: v3(0, 0.6, 0), fov: 52 } },
  { key: "moon", cam: { pos: v3(0, 0.9, 6.2), look: v3(0, 0.2, 0), fov: 50 } },
  { key: "sun", cam: { pos: v3(0, 2.2, 18), look: v3(0, 0.7, 0), fov: 54 } },
  { key: "system", cam: { pos: v3(0, 26, 135), look: v3(0, 0, 0), fov: 62 } },
  { key: "asteroids", cam: { pos: v3(0, 3.0, 26), look: v3(0, 0, 0), fov: 52 } },
  { key: "gas", cam: { pos: v3(0, 7.0, 52), look: v3(0, 0, 0), fov: 56 } },
  { key: "supernova", cam: { pos: v3(0, 3.6, 28), look: v3(0, 0, 0), fov: 54 } },
  { key: "galaxy", cam: { pos: v3(0, 110, 520), look: v3(0, 0, 0), fov: 64 } },
  { key: "blackhole", cam: { pos: v3(0, 5.5, 18), look: v3(0, 0, 0), fov: 50 } },
  { key: "inside", cam: { pos: v3(0, 0.7, 2.1), look: v3(0, 0.2, 0), fov: 46 } },
];

export const STAGE_COUNT = STAGES.length;
