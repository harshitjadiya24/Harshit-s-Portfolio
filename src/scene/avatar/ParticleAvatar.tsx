import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Plane,
  Points,
  ShaderMaterial,
  Vector3,
} from "three"
import { reducedMotion } from "../../motion/eases"
import { palette, quality, sceneState } from "../sceneState"
import type { FaceCloud } from "./cloud"
import { fragmentShader, vertexShader } from "./shaders"

function buildGeometry(cloud: FaceCloud) {
  const { count } = cloud
  const scatter = new Float32Array(count * 3)
  const random = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    // Nebula shell the face condenses out of.
    const u = Math.random() * 2 - 1
    const th = Math.random() * Math.PI * 2
    const r = 2.6 + Math.random() * 3.2
    const s = Math.sqrt(1 - u * u)
    scatter[i * 3] = r * s * Math.cos(th)
    scatter[i * 3 + 1] = r * u * 0.7
    scatter[i * 3 + 2] = r * s * Math.sin(th) - 1.5
    for (let k = 0; k < 4; k++) random[i * 4 + k] = Math.random()
  }
  const g = new BufferGeometry()
  g.setAttribute("position", new BufferAttribute(cloud.positions.subarray(0, count * 3), 3))
  g.setAttribute("aScatter", new BufferAttribute(scatter, 3))
  g.setAttribute("aRandom", new BufferAttribute(random, 4))
  g.setAttribute("aBright", new BufferAttribute(cloud.brightness.subarray(0, count), 1))
  return g
}

const plane = new Plane(new Vector3(0, 0, 1), 0)
const hit = new Vector3()

export function ParticleAvatar({ cloud }: { cloud: FaceCloud }) {
  const group = useRef<Group>(null)
  const points = useRef<Points<BufferGeometry, ShaderMaterial>>(null)
  const viewport = useThree((s) => s.viewport)
  const dpr = useThree((s) => s.viewport.dpr)
  const lastMove = useRef(-10)
  const mouseLocal = useRef(new Vector3(9, 9, 0))

  const geometry = useMemo(() => buildGeometry(cloud), [cloud])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uForm: { value: 0 },
          uMotion: { value: reducedMotion() ? 0 : 1 },
          uSize: { value: 15 * Math.sqrt(40_000 / quality.points) * 0.85 },
          uPixelRatio: { value: 1 },
          uFade: { value: 1 },
          uMouse: { value: new Vector3(9, 9, 0) },
          uMouseStrength: { value: 0 },
          uRadius: { value: 0.62 },
          uDeep: { value: new Color(palette.deep) },
          uInk: { value: new Color(palette.ink) },
          uSignal: { value: new Color(palette.signal) },
        },
      }),
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    const mark = () => {
      lastMove.current = performance.now() / 1000
    }
    window.addEventListener("pointermove", mark, { passive: true })
    return () => window.removeEventListener("pointermove", mark)
  }, [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g || !points.current) return
    const dt = Math.min(delta, 1 / 30)
    const u = points.current.material.uniforms
    const t = state.clock.elapsedTime

    // Layout: right of centre on wide screens, behind the type on narrow ones.
    const wide = viewport.aspect > 1.05
    const scale = wide ? viewport.height / 3.3 : Math.min(viewport.width / 2.2, viewport.height / 3.6)
    const exit = sceneState.heroExit
    const tx = wide ? viewport.width * 0.2 : 0
    const ty = (wide ? -0.05 : viewport.height * 0.06) + exit * viewport.height * 0.35
    const ease = 1 - Math.exp(-dt * 4)
    g.position.x = MathUtils.lerp(g.position.x, tx, ease)
    g.position.y = MathUtils.lerp(g.position.y, ty, ease)
    g.scale.setScalar(scale)

    // Head follows the pointer a little: attention, not a puppet.
    const p = state.pointer
    g.rotation.y = MathUtils.lerp(g.rotation.y, p.x * 0.28 + Math.sin(t * 0.3) * 0.04, ease)
    g.rotation.x = MathUtils.lerp(g.rotation.x, -p.y * 0.14, ease)

    // Pointer ray → z=0 plane → avatar-local space.
    state.raycaster.setFromCamera(p, state.camera)
    if (state.raycaster.ray.intersectPlane(plane, hit)) {
      g.worldToLocal(hit)
      mouseLocal.current.lerp(hit, 1 - Math.exp(-dt * 14))
    }
    u.uMouse.value.copy(mouseLocal.current)
    // Disturbance fades back to calm ~1.5s after the pointer goes still.
    const want = performance.now() / 1000 - lastMove.current < 1.5 ? 1 : 0
    u.uMouseStrength.value = MathUtils.lerp(
      u.uMouseStrength.value,
      want,
      1 - Math.exp(-dt * (want ? 6 : 1.2)),
    )

    u.uTime.value = t
    u.uForm.value = sceneState.form
    u.uFade.value = (wide ? 1 : 0.7) * (1 - exit * 0.8)
    u.uPixelRatio.value = dpr
  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
