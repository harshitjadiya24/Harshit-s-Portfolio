/**
 * Mutable scene state shared between DOM (GSAP/ScrollTrigger writers) and
 * WebGL (useFrame readers). Plain object on purpose: no React renders per frame.
 */
export const sceneState = {
  /** 0 = scattered nebula, 1 = formed face. Tweened once the loader lifts. */
  form: 0,
  /** Scroll story: 0 face → 1 neural graph → 2 data cube → 3 back to nebula. */
  morph: 0,
  /** Horizontal anchor as a fraction of viewport width (narrow screens damp it). */
  x: 0.25,
  /** Vertical anchor as a fraction of viewport height. */
  y: 0,
  /** Multiplier on the responsive base scale. */
  scale: 1,
  /** Overall opacity, so the field can sit behind text. */
  fade: 1,
}

/** WebGL mirrors of the CSS tokens, per theme. */
export const palette = {
  bg: "#040817",
  deep: "#314c7e",
  dim: "#94a6be",
  ink: "#ecf3fa",
  signal: "#bbec4c",
  pulse: "#b688fe",
}

export const paletteLight = {
  bg: "#f3f6fa",
  deep: "#a9b8cc",
  dim: "#5d6b82",
  ink: "#16213a",
  signal: "#4f7d14",
  pulse: "#7b4fd6",
}

export const palettes = { dark: palette, light: paletteLight }

const coarse =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
const lowCore = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4

export const quality = {
  points: coarse || lowCore ? 24_000 : 70_000,
  maxDpr: coarse ? 1.5 : 1.75,
}

/** WebGL2 or nothing: without it the Stage stays unmounted and the DOM stands alone. */
export const hasWebGL = (() => {
  try {
    return typeof document !== "undefined" && !!document.createElement("canvas").getContext("webgl2")
  } catch {
    return false
  }
})()
