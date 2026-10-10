/**
 * Mutable scene state shared between DOM (GSAP/ScrollTrigger writers) and
 * WebGL (useFrame readers). Plain object on purpose: no React renders per frame.
 */
export const sceneState = {
  /** 0 = scattered nebula, 1 = formed face. Tweened once the loader lifts. */
  form: 0,
  /** 0 → 1 as the hero scrolls out of view. */
  heroExit: 0,
  /** Phase 2: 0 face → 1 neural graph → 2 data cube. */
  morph: 0,
}

export const palette = {
  bg: "#040817",
  deep: "#314c7e",
  dim: "#94a6be",
  ink: "#ecf3fa",
  signal: "#bbec4c",
  pulse: "#b688fe",
}

const coarse =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
const lowCore = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4

export const quality = {
  points: coarse || lowCore ? 15_000 : 40_000,
  maxDpr: coarse ? 1.5 : 1.75,
}
