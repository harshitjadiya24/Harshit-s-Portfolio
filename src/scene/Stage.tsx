import { Canvas } from "@react-three/fiber"
import { Suspense, use } from "react"
import { loadFaceCloud } from "./avatar/cloud"
import { ParticleAvatar } from "./avatar/ParticleAvatar"
import { quality } from "./sceneState"

function Avatar() {
  const cloud = use(loadFaceCloud())
  return <ParticleAvatar cloud={cloud} />
}

/** Fixed full-viewport WebGL layer behind the DOM. */
export function Stage() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35, near: 0.1, far: 40 }}
        dpr={[1, quality.maxDpr]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
      </Canvas>
    </div>
  )
}
