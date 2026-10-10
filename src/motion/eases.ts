import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText)

// One curve family across GSAP, Motion and CSS (--ease-expo / --ease-quint).
CustomEase.create("expo", "M0,0 C0.16,1 0.3,1 1,1")
CustomEase.create("quint", "M0,0 C0.83,0 0.17,1 1,1")

export const EXPO = [0.16, 1, 0.3, 1] as const
export const QUINT = [0.83, 0, 0.17, 1] as const

export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

export { gsap, ScrollTrigger, SplitText }
