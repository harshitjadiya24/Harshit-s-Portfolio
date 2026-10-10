import { gsap, reducedMotion, SplitText } from "./eases"

type Options = {
  delay?: number
  stagger?: number
  from?: "start" | "center" | "end" | "random"
}

/**
 * Cinematic title entrance: chars swing up out of depth on X and
 * rack-focus from blur. Call inside useGSAP so SplitText reverts with the scope.
 */
export function splitReveal(target: gsap.TweenTarget, opts: Options = {}) {
  if (reducedMotion()) {
    gsap.set(target, { autoAlpha: 1 })
    return
  }
  const split = SplitText.create(target as Element, {
    type: "words,chars",
    charsClass: "split-char",
  })
  gsap.set(target, { autoAlpha: 1 })
  return gsap.from(split.chars, {
    opacity: 0,
    rotationX: -95,
    yPercent: 55,
    z: -180,
    filter: "blur(18px)",
    transformOrigin: "50% 50% -0.4em",
    transformPerspective: 900,
    duration: 1.5,
    ease: "expo",
    delay: opts.delay ?? 0,
    stagger: { each: opts.stagger ?? 0.035, from: opts.from ?? "start" },
    clearProps: "filter,willChange",
  })
}
