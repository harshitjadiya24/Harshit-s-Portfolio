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
import { buildMorphTargets } from "./targets"

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
  const morph = buildMorphTargets(count)
  g.setAttribute("aGraph", new BufferAttribute(morph.graph, 3))
  g.setAttribute("aGraphMeta", new BufferAttribute(morph.graphMeta, 2))
  g.setAttribute("aCube", new BufferAttribute(morph.cube, 3))
  g.setAttribute("aCubeBright", new BufferAttribute(morph.cubeBright, 1))
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
        // Drawn over the project planes so the cube glows across the Work section.
        depthTest: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uForm: { value: 0 },
          uMorph: { value: 0 },
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

    // Layout comes from the scroll story; narrow screens keep the field centred.
    const wide = viewport.aspect > 1.05
    const base = wide ? viewport.height / 3.3 : Math.min(viewport.width / 2.2, viewport.height / 3.6)
    const tx = sceneState.x * viewport.width * (wide ? 1 : 0.15)
    const ty = (sceneState.y + (wide ? -0.01 : 0.06)) * viewport.height
    const ease = 1 - Math.exp(-dt * 4)
    g.position.x = MathUtils.lerp(g.position.x, tx, ease)
    g.position.y = MathUtils.lerp(g.position.y, ty, ease)
    g.scale.setScalar(base * sceneState.scale)

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
    u.uMorph.value = sceneState.morph
    // Narrow screens: the field sits behind full-width type, so it steps back further.
    u.uFade.value = (wide ? 1 : 0.7 - Math.max(0, sceneState.morph - 1) * 0.25) * sceneState.fade
    u.uPixelRatio.value = dpr
  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
