import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  NormalBlending,
  Plane,
  Points,
  ShaderMaterial,
  Vector3,
} from "three"
import { reducedMotion } from "../../motion/eases"
import type { Theme } from "../../theme"
import { palettes, quality, sceneState } from "../sceneState"
import type { FaceCloud } from "./cloud"
import { fragmentShader, vertexShader } from "./shaders"
import { freeSpot } from "./freeSpot"
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

export function ParticleAvatar({ cloud, theme }: { cloud: FaceCloud; theme: Theme }) {
  const group = useRef<Group>(null)
  const points = useRef<Points<BufferGeometry, ShaderMaterial>>(null)
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
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
          uDeep: { value: new Color(palettes.dark.deep) },
          uInk: { value: new Color(palettes.dark.ink) },
          uSignal: { value: new Color(palettes.dark.signal) },
        },
      }),
    [],
  )

  // Dark: dots emit light (additive). Light: dots are ink on paper (normal blend).
  useEffect(() => {
    const m = points.current?.material
    if (!m) return
    const pal = palettes[theme]
    m.blending = theme === "light" ? NormalBlending : AdditiveBlending
    m.uniforms.uDeep.value.set(pal.deep)
    m.uniforms.uInk.value.set(pal.ink)
    m.uniforms.uSignal.value.set(pal.signal)
    m.needsUpdate = true
  }, [theme])

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
    let tx = sceneState.x * viewport.width * (wide ? 1 : 0.15)
    let ty = (sceneState.y + (wide ? -0.01 : 0.06)) * viewport.height

    // In Work the cube stays on screen, gliding into whatever space is free of text.
    const m = sceneState.morph
    const avoid = wide ? MathUtils.smoothstep(m, 1.55, 1.95) * (1 - MathUtils.smoothstep(m, 2.05, 2.5)) : 0
    if (avoid > 0) {
      const k = viewport.width / size.width
      // Projected half-size of the spinning, tilted cube, in CSS px.
      const radius = (1.3 * base * sceneState.scale) / k
      const spot = freeSpot(radius, size.width, size.height)
      tx = MathUtils.lerp(tx, (spot.x - size.width / 2) * k, avoid)
      ty = MathUtils.lerp(ty, -(spot.y - size.height / 2) * k, avoid)
    }
    const ease = 1 - Math.exp(-dt * 3)
    g.position.x = MathUtils.lerp(g.position.x, tx, ease)
    g.position.y = MathUtils.lerp(g.position.y, ty, ease)
    g.scale.setScalar(base * sceneState.scale)

    // Always face the camera head-on. Off-centre, a perspective camera sees
    // the relief at an angle, which turns and squashes the face as it moves.
    // The cursor never rotates it; it only scatters the particles it touches.
    const cam = state.camera.position
    const dz = cam.z - g.position.z
    // Forward (+z) turned by these angles points back at the camera.
    g.rotation.y = Math.atan2(cam.x - g.position.x, dz)
    g.rotation.x = Math.atan2(g.position.y - cam.y, Math.hypot(g.position.x - cam.x, dz))
    const p = state.pointer

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
    // Narrow screens have no free gutter: past the graph, the field is just texture.
    const narrow = MathUtils.lerp(0.7, 0.15, MathUtils.clamp(sceneState.morph - 1, 0, 1))
    // Ink on paper competes with text more than light on navy: past the
    // portrait, light mode halves the field behind the copy.
    const ink = theme === "light" ? MathUtils.lerp(1, 0.5, MathUtils.clamp(sceneState.morph, 0, 1)) : 1
    u.uFade.value = (wide ? 1 : narrow) * ink * sceneState.fade
    u.uPixelRatio.value = dpr
  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
