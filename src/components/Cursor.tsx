import { motion, useMotionValue, useSpring } from "motion/react"
import { useEffect, useState } from "react"
import { EXPO } from "../motion/eases"

/**
 * Dot tracks 1:1; the ring trails on a spring. The ring is filled ink in
 * difference mode, so over interactive targets it grows into a lens that
 * inverts whatever sits beneath it.
 */
export function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const [fine, setFine] = useState(
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const onMq = () => setFine(mq.matches)
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null
      setHover(!!el?.closest?.("a, button, input, [data-cursor='hover']"))
    }
    const press = () => setDown(true)
    const release = () => setDown(false)
    mq.addEventListener("change", onMq)
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerover", over, { passive: true })
    window.addEventListener("pointerdown", press)
    window.addEventListener("pointerup", release)
    return () => {
      mq.removeEventListener("change", onMq)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerover", over)
      window.removeEventListener("pointerdown", press)
      window.removeEventListener("pointerup", release)
    }
  }, [x, y])

  if (!fine) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference" aria-hidden>
      <motion.div
        className="absolute top-0 left-0 size-11 rounded-full bg-ink"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hover ? 2.6 : down ? 0.35 : 0.22 }}
        transition={{ duration: 0.55, ease: EXPO }}
      />
      <motion.div
        className="absolute top-0 left-0 size-1.5 rounded-full bg-ink"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hover ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}
