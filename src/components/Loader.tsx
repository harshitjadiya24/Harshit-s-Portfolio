import { useGSAP } from "@gsap/react"
import { useRef, useState } from "react"
import { gsap, reducedMotion } from "../motion/eases"
import { loadFaceCloud } from "../scene/avatar/cloud"
import { getTheme } from "../theme"
import { quality } from "../scene/sceneState"

/**
 * Counter is honest-ish: it eases toward 80 on its own and only reaches 100
 * once fonts and the point cloud are actually ready. Then the curtain lifts.
 */
export function Loader({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const counter = { v: 0 }
      const render = () => {
        if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, "0")
      }
      const crawl = gsap.to(counter, { v: 80, duration: 2.4, ease: "expo", onUpdate: render })
      let cancelled = false

      Promise.all([document.fonts.ready, loadFaceCloud(getTheme())]).then(() => {
        if (cancelled) return
        crawl.kill()
        gsap
          .timeline()
          .to(counter, { v: 100, duration: 0.6, ease: "expo", onUpdate: render })
          .add(onReveal, "+=0.1")
          .to(root.current, {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: reducedMotion() ? 0.01 : 1.2,
            ease: "quint",
            onComplete: () => setGone(true),
          }, "<")
      })
      return () => {
        cancelled = true
      }
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-bg px-4 py-5 md:px-10 md:py-8"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      role="status"
      aria-label="Loading"
    >
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
        <span>Harshit Jadiya</span>
        <span className="tabular">Sampling {quality.points.toLocaleString("en-US")} points</span>
      </div>
      <span
        ref={num}
        className="tabular font-display text-[clamp(6rem,30vw,22rem)] font-semibold leading-[0.8] tracking-[-0.04em] text-ink"
      >
        000
      </span>
    </div>
  )
}
