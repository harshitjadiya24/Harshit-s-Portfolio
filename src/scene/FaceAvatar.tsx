import { useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import { Color, MathUtils, Mesh, Group } from "three"
import { useFace } from "../face/FaceContext"

function Eye({ side }: { side: 1 | -1 }) {
  const lid = useRef<Mesh>(null)
  const iris = useRef<Group>(null)
  const { pointer } = useThree()
  const { expression } = useFace()
  const blink = useRef(0)
  const nextBlink = useRef(2.2)

  useFrame((_, dt) => {
    nextBlink.current -= dt
    if (nextBlink.current < 0) {
      blink.current = 1
      nextBlink.current = 2 + Math.random() * 3.5
    }
    blink.current = Math.max(0, blink.current - dt * 8)
    const wink = expression === "wink" && side === 1 ? 1 : 0
    const close = Math.min(1, Math.max(blink.current > 0.4 ? 1 : blink.current * 2.2, wink))
    if (lid.current) {
      lid.current.position.y = MathUtils.lerp(0.1, -0.02, close)
      lid.current.scale.y = MathUtils.lerp(0.35, 1.15, close)
    }
    if (iris.current) {
      iris.current.position.x = pointer.x * 0.05
      iris.current.position.y = pointer.y * 0.035 + (expression === "think" ? 0.025 : 0)
    }
  })

  return (
    <group position={[side * 0.2, 0.14, 0.5]}>
      <mesh>
        <sphereGeometry args={[0.105, 32, 32]} />
        <meshPhysicalMaterial color="#fbf8f2" roughness={0.18} clearcoat={0.6} />
      </mesh>
      <group ref={iris} position={[0, 0, 0.04]}>
        <mesh position={[0, 0, 0.028]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial
            color="#0d3d36"
            emissive={new Color("#4ad6c8")}
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#05080a" />
        </mesh>
        <mesh position={[0.018, 0.02, 0.085]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <mesh
        ref={lid}
        position={[0, 0.1, 0.01]}
        rotation={[0.15, 0, side * 0.08]}
        scale={[1.15, 0.35, 1.05]}
      >
        <sphereGeometry args={[0.11, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a1c16" roughness={0.7} />
      </mesh>
    </group>
  )
}

function SkinMaterial() {
  return (
    <meshPhysicalMaterial
      color="#e6b394"
      roughness={0.38}
      clearcoat={0.45}
      clearcoatRoughness={0.35}
      sheen={0.55}
      sheenColor={new Color("#ff9eb5")}
    />
  )
}

function Mouth() {
  const mesh = useRef<Mesh>(null)
  const inner = useRef<Mesh>(null)
  const { expression, speaking } = useFace()
  const phase = useRef(0)

  useFrame((_, dt) => {
    phase.current += dt * (speaking || expression === "speak" ? 16 : 1.5)
    const talk =
      speaking || expression === "speak"
        ? (Math.sin(phase.current) * 0.5 + 0.5) * 0.7
        : 0
    let open = 0.22 + talk
    let width = 1.05
    let y = -0.22
    if (expression === "smile") {
      open = 0.28 + talk * 0.15
      width = 1.45
      y = -0.2
    } else if (expression === "wow") {
      open = 0.85
      width = 0.72
      y = -0.24
    } else if (expression === "think") {
      open = 0.16
      width = 0.7
      y = -0.23
    } else if (expression === "wink") {
      open = 0.32
      width = 1.25
    } else if (expression === "idle") {
      open = 0.18
      width = 0.9
    }
    if (mesh.current) {
      mesh.current.scale.set(
        MathUtils.lerp(mesh.current.scale.x, width, 0.18),
        MathUtils.lerp(mesh.current.scale.y, open, 0.22),
        1,
      )
      mesh.current.position.y = MathUtils.lerp(mesh.current.position.y, y, 0.16)
    }
    if (inner.current) {
      inner.current.scale.y = MathUtils.lerp(inner.current.scale.y, open * 0.9, 0.22)
    }
  })

  return (
    <group>
      <mesh ref={mesh} position={[0, -0.22, 0.48]}>
        <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
        <meshStandardMaterial color="#5a1428" roughness={0.4} />
      </mesh>
      <mesh ref={inner} position={[0, -0.22, 0.49]} scale={[0.7, 0.2, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#2a0810" />
      </mesh>
    </group>
  )
}

export function FaceAvatar() {
  const group = useRef<Group>(null)
  const head = useRef<Group>(null)
  const { pointer, size } = useThree()
  const { expression } = useFace()
  const scroll = useRef(0)

  useFrame((state) => {
    const max = document.body.scrollHeight - window.innerHeight
    scroll.current = MathUtils.lerp(
      scroll.current,
      max > 0 ? window.scrollY / max : 0,
      0.08,
    )
    const t = scroll.current
    const mobile = size.width < 900
    if (group.current) {
      const targetX = mobile ? 0 : MathUtils.lerp(1.28, -1.45, t)
      const targetY = mobile ? -0.05 : MathUtils.lerp(-0.08, 0.12, Math.sin(t * Math.PI))
      group.current.position.x = MathUtils.lerp(group.current.position.x, targetX, 0.06)
      group.current.position.y = MathUtils.lerp(group.current.position.y, targetY, 0.06)
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        pointer.x * 0.4 + (expression === "think" ? -0.2 : 0.08),
        0.09,
      )
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        -pointer.y * 0.2 + (expression === "wow" ? -0.1 : 0.04),
        0.09,
      )
    }
    if (head.current) {
      head.current.position.y = Math.sin(state.clock.elapsedTime * 1.15) * 0.025
    }
  })

  return (
    <group ref={group} position={[1.28, -0.08, 0]} scale={1.22}>
      <group ref={head}>
        <mesh scale={[0.92, 1.08, 0.88]}>
          <sphereGeometry args={[0.58, 64, 64]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[0, -0.12, 0.08]} scale={[0.78, 0.7, 0.7]}>
          <sphereGeometry args={[0.5, 48, 48]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[-0.55, 0.02, 0.02]} rotation={[0, 0, 0.25]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[0.55, 0.02, 0.02]} rotation={[0, 0, -0.25]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[0, 0.58, -0.08]} scale={[1.05, 0.42, 1.05]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#140f18" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.28, -0.38]} scale={[1.15, 0.85, 0.55]}>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial color="#100c14" roughness={0.95} />
        </mesh>
        <mesh position={[-0.42, 0.22, -0.12]} scale={[0.42, 0.7, 0.45]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color="#161018" roughness={0.9} />
        </mesh>
        <mesh position={[0.42, 0.22, -0.12]} scale={[0.42, 0.7, 0.45]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color="#161018" roughness={0.9} />
        </mesh>
        <mesh position={[-0.3, 0.0, 0.38]} scale={[0.85, 0.5, 0.45]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#e29a88"
            emissive={new Color("#ff6b8a")}
            emissiveIntensity={expression === "smile" || expression === "wink" ? 0.22 : 0.06}
          />
        </mesh>
        <mesh position={[0.3, 0.0, 0.38]} scale={[0.85, 0.5, 0.45]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#e29a88"
            emissive={new Color("#ff6b8a")}
            emissiveIntensity={expression === "smile" || expression === "wink" ? 0.22 : 0.06}
          />
        </mesh>
        <mesh position={[0, 0.02, 0.58]} rotation={[0.35, 0, 0]}>
          <capsuleGeometry args={[0.045, 0.1, 4, 10]} />
          <meshStandardMaterial color="#d9a086" roughness={0.5} />
        </mesh>
        <mesh position={[-0.2, 0.34, 0.42]} rotation={[0, 0, 0.18]} scale={[1, 0.55, 1]}>
          <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
          <meshStandardMaterial color="#1a1210" />
        </mesh>
        <mesh position={[0.2, 0.34, 0.42]} rotation={[0, 0, -0.18]} scale={[1, 0.55, 1]}>
          <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
          <meshStandardMaterial color="#1a1210" />
        </mesh>
        <Eye side={-1} />
        <Eye side={1} />
        <Mouth />
        <mesh position={[0, -0.68, 0.02]}>
          <cylinderGeometry args={[0.14, 0.2, 0.22, 20]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[0, -1.02, 0.04]} rotation={[0.12, 0, 0]}>
          <capsuleGeometry args={[0.4, 0.52, 8, 20]} />
          <meshPhysicalMaterial
            color="#101018"
            metalness={0.62}
            roughness={0.22}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 420]}
          />
        </mesh>
      </group>
    </group>
  )
}
