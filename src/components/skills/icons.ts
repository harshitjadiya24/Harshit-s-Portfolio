import {
  siC,
  siGsap,
  siHuggingface,
  siMongodb,
  siNodedotjs,
  siNvidia,
  siOpencv,
  siPython,
  siPytorch,
  siReact,
  siSocketdotio,
  siThreedotjs,
  siTypescript,
} from "simple-icons"

/** Named imports only, so the bundle carries 13 paths, not the whole set. */
export const icons = {
  python: siPython,
  typescript: siTypescript,
  c: siC,
  pytorch: siPytorch,
  nvidia: siNvidia,
  huggingface: siHuggingface,
  opencv: siOpencv,
  react: siReact,
  three: siThreedotjs,
  gsap: siGsap,
  node: siNodedotjs,
  mongodb: siMongodb,
  socketio: siSocketdotio,
}

export type IconKey = keyof typeof icons
