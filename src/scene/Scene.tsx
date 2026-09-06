import { ContactShadows, Environment } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { FaceAvatar } from "./FaceAvatar"
import { HaloField } from "./HaloField"

export function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.15, 4.2], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#07070c"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} color="#fff4e8" />
        <directionalLight position={[-3, 1, 2]} intensity={0.55} color="#c77dff" />
        <pointLight position={[1.2, 0.4, 2]} intensity={1.2} color="#d8ff4a" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <HaloField />
          <FaceAvatar />
          <ContactShadows
            position={[0, -1.65, 0]}
            opacity={0.45}
            scale={12}
            blur={2.4}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
