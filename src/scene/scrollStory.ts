import { gsap } from "../motion/eases"
import { sceneState } from "./sceneState"

type Beat = Partial<Pick<typeof sceneState, "morph" | "x" | "y" | "scale" | "fade">>

/** Resting pose per section. Each scroll segment tweens from one to the next. */
const poses = {
  hero: { morph: 0, x: 0.2, y: 0, scale: 1, fade: 1 },
  about: { morph: 1, x: 0, y: 0, scale: 1.15, fade: 0.6 },
  skills: { fade: 0.16 },
  work: { morph: 2, x: 0.3, y: 0.05, scale: 0.72, fade: 0.75 },
  contact: { morph: 3, x: -0.05, y: 0, scale: 1.1, fade: 0.45 },
} satisfies Record<string, Beat>

const segment = (trigger: string, start: string, end: string, from: Beat, to: Beat) =>
  gsap.fromTo(sceneState, from, {
    ...to,
    ease: "none",
    immediateRender: false,
    scrollTrigger: { trigger, start, end, scrub: 0.8 },
  })

/**
 * Scroll-driven storytelling for the particle field: face → neural graph →
 * data cube → nebula. Segments never overlap, so each owns its range.
 * Call inside a useGSAP scope so the triggers revert with it.
 */
export function scrollStory() {
  const { hero, about, skills, work, contact } = poses
  segment("#about", "top bottom", "top 15%", hero, about)
  segment("#skills", "top 85%", "top 25%", { fade: about.fade }, skills)
  segment("#work", "top 95%", "top 5%", { ...about, ...skills }, work)
  segment("#contact", "top bottom", "top 20%", work, contact)
}
