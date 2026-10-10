import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useRef, type ReactNode } from "react"

const spring = { stiffness: 220, damping: 18, mass: 0.4 }

type Props = {
  children: ReactNode
  onClick?: () => void
  className?: string
  /** Fraction of the cursor offset the body follows. */
  pull?: number
}

/** Body leans toward the cursor; the label leans further for parallax depth. */
export function MagneticButton({ children, onClick, className = "", pull = 0.35 }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)
  const lx = useTransform(sx, (v) => v * 0.6)
  const ly = useTransform(sy, (v) => v * 0.6)

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * pull)
    y.set((e.clientY - (r.top + r.height / 2)) * pull)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      data-cursor="hover"
      className={className}
    >
      <motion.span style={{ x: lx, y: ly }} className="relative flex items-center gap-3">
        {children}
      </motion.span>
    </motion.button>
  )
}
