import { Float, Sparkles } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Color, Mesh } from "three"

export function HaloField() {
  const ring = useRef<Mesh>(null)
  const ring2 = useRef<Mesh>(null)

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (ring.current) {
      ring.current.rotation.z = t * 0.15
      ring.current.rotation.x = 0.6 + Math.sin(t * 0.2) * 0.1
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.22
      ring2.current.rotation.y = t * 0.12
    }
  })

  const color = useMemo(() => new Color("#d8ff4a"), [])

  return (
    <group>
      <mesh ref={ring} position={[1.2, 0.1, -0.6]}>
        <torusGeometry args={[1.55, 0.008, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2} position={[1.2, 0.1, -0.6]}>
        <torusGeometry args={[1.9, 0.006, 16, 140]} />
        <meshBasicMaterial color="#c77dff" transparent opacity={0.35} />
      </mesh>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[-1.6, 0.9, -1.2]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshPhysicalMaterial
            color="#c77dff"
            emissive="#c77dff"
            emissiveIntensity={0.35}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh position={[2.4, -0.9, -0.8]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshPhysicalMaterial
            color="#6ee7ff"
            emissive="#6ee7ff"
            emissiveIntensity={0.3}
            roughness={0.15}
            metalness={0.5}
          />
        </mesh>
      </Float>
      <Sparkles
        count={80}
        scale={[10, 6, 4]}
        size={3}
        speed={0.4}
        color="#f4f1ea"
        opacity={0.45}
      />
    </group>
  )
}
