import { advance, Canvas } from "@react-three/fiber"
import { Suspense, use, useEffect } from "react"
import { gsap } from "../motion/eases"
import { loadFaceCloud } from "./avatar/cloud"
import { ParticleAvatar } from "./avatar/ParticleAvatar"
import { hasWebGL, quality } from "./sceneState"
import { LiquidPlane } from "./work/LiquidPlane"
import { useSlots } from "./work/registry"

function Avatar() {
  const cloud = use(loadFaceCloud())
  return <ParticleAvatar cloud={cloud} />
}

function WorkGallery() {
  const slots = useSlots()
  return slots.map((s) => <LiquidPlane key={s.project.slug} slot={s} />)
}

/**
 * Renders on GSAP's ticker, after Lenis has scrolled for the frame, so planes
 * pinned to DOM bands never trail the page by a frame.
 */
function TickerLoop() {
  useEffect(() => {
    const tick = (time: number) => advance(time)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])
  return null
}

/** Fixed full-viewport WebGL layer behind the DOM. Absent without WebGL2; the DOM stands alone. */
export function Stage() {
  if (!hasWebGL) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        frameloop="never"
        camera={{ position: [0, 0, 6], fov: 35, near: 0.1, far: 40 }}
        dpr={[1, quality.maxDpr]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <TickerLoop />
        <WorkGallery />
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
      </Canvas>
    </div>
  )
}
