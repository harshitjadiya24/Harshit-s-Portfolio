import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2, type Texture } from "three"
import { reducedMotion } from "../../motion/eases"
import { noise } from "../avatar/shaders"
import { palette } from "../sceneState"
import { aspectOf, loadPoster, loadVideo } from "./media"
import type { MediaSlot } from "./registry"

const vertexShader = /* glsl */ `
uniform float uHover;
uniform float uMotion;
uniform vec2 uMouse;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  // The surface bellies toward the camera around the pointer mid-transition.
  float bulge = sin(uHover * 3.14159) * uMotion;
  float d = distance(uv, uMouse);
  p.z += exp(-d * d * 6.0) * bulge * 0.06;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform sampler2D uPoster;
uniform sampler2D uVideo;
uniform float uHasVideo;
uniform float uPosterAspect;
uniform float uVideoAspect;
uniform float uAspect;
uniform float uHover;
uniform float uReveal;
uniform float uMotion;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uRes;
uniform vec3 uAccent;
uniform vec3 uBg;
varying vec2 vUv;

${noise}

// anchorX: 0 keeps the left edge (posters set their title there), 0.5 centres.
vec2 cover(vec2 uv, float texAspect, float anchorX) {
  vec2 s = uAspect > texAspect ? vec2(1.0, texAspect / uAspect) : vec2(uAspect / texAspect, 1.0);
  vec2 o = vec2(anchorX, 0.5);
  return (uv - o) * s + o;
}

float hash(float n) { return fract(sin(n) * 43758.5453); }

// The stand-in preview: a live contour map of a noise terrain in the accent.
vec3 preview(vec2 uv) {
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 2.6;
  float t = uTime * uMotion;
  float f = snoise(vec3(p, t * 0.12));
  f += 0.5 * snoise(vec3(p * 2.1 + f, t * 0.2));
  // Distance to the nearest contour, in screen pixels, for crisp hairlines.
  float c = f * 3.5;
  float dc = abs(fract(c + 0.5) - 0.5) / max(fwidth(c), 1e-4);
  float line = 1.0 - smoothstep(0.6, 1.6, dc);
  vec3 col = mix(uBg, uBg + uAccent * 0.16, smoothstep(-0.7, 0.9, f));
  col += uAccent * line * 0.85;
  col *= 0.92 + 0.08 * sin(uv.y * uRes.y * 1.2);
  return col;
}

vec3 sampleB(vec2 uv) {
  return uHasVideo > 0.5 ? texture2D(uVideo, cover(uv, uVideoAspect, 0.5)).rgb : preview(uv);
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uAspect, 1.0);
  float t = uTime * uMotion;
  float h = uHover;

  // Liquid front: the preview floods outward from the pointer with a noisy rim.
  float n = snoise(vec3(uv * asp * 2.4, t * 0.35));
  float reach = h * (length(asp) + 0.5);
  float d = distance(uv * asp, uMouse * asp) + n * 0.22;
  // Gated on h: at rest the noisy front would otherwise leak a few pixels.
  float m = smoothstep(reach, reach - 0.3, d) * smoothstep(0.0, 0.08, h);
  float rim = m * (1.0 - m) * 4.0;

  vec2 disp = vec2(n, snoise(vec3(uv * asp * 2.4 + 9.1, t * 0.35))) * rim * 0.07 * uMotion;

  // Glitch: a few horizontal slices tear sideways while the front passes.
  float row = floor(uv.y * 34.0);
  float tear = step(0.88, hash(row + floor(t * 14.0))) * sin(h * 3.14159) * uMotion;
  disp.x += (hash(row * 3.1) - 0.5) * tear * 0.08;

  // Chromatic split, strongest on the rim.
  float split = (rim * 0.014 + sin(h * 3.14159) * 0.004) * uMotion;
  vec2 ua = cover(uv + disp, uPosterAspect, 0.0);
  vec3 a = vec3(
    texture2D(uPoster, ua + vec2(split, 0.0)).r,
    texture2D(uPoster, ua).g,
    texture2D(uPoster, ua - vec2(split, 0.0)).b
  );
  vec3 b = sampleB(uv - disp * 0.6);
  vec3 col = mix(a, b, m);
  col += uAccent * rim * 0.35;

  // Scroll reveal: a noise-edged wipe rising from the bottom.
  float rv = uReveal * 1.25;
  float edge = uv.y + snoise(vec3(uv.x * 3.0, uv.y, 1.7)) * 0.08;
  float shown = smoothstep(rv, rv - 0.12, edge);

  gl_FragColor = vec4(col, shown);
  #include <colorspace_fragment>
}
`

const geometry = new PlaneGeometry(1, 1, 48, 24)

/**
 * One project's media, drawn into the main canvas and pinned to its DOM band
 * every frame, so the whole Work list shares the avatar's WebGL context.
 */
export function LiquidPlane({ slot }: { slot: MediaSlot }) {
  const mesh = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null)
  const size = useThree((s) => s.size)
  const viewport = useThree((s) => s.viewport)
  const video = useRef<HTMLVideoElement | null>(null)

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uPoster: { value: null as Texture | null },
          uVideo: { value: null as Texture | null },
          uHasVideo: { value: 0 },
          uPosterAspect: { value: 2 },
          uVideoAspect: { value: 16 / 9 },
          uAspect: { value: 2 },
          uHover: { value: 0 },
          uReveal: { value: 0 },
          uMotion: { value: reducedMotion() ? 0 : 1 },
          uTime: { value: 0 },
          uMouse: { value: new Vector2(0.5, 0.5) },
          uRes: { value: new Vector2(1, 1) },
          uAccent: { value: new Color(slot.project.accent) },
          uBg: { value: new Color(palette.bg) },
        },
      }),
    [slot],
  )

  useEffect(() => {
    let alive = true
    const u = material.uniforms
    loadPoster(slot.project).then((t) => {
      if (!alive) return t.dispose()
      u.uPoster.value = t
      u.uPosterAspect.value = aspectOf(t)
    })
    let vt: Texture | null = null
    if (slot.project.video) {
      const { video: v, texture } = loadVideo(slot.project.video)
      vt = texture
      v.addEventListener("loadedmetadata", () => {
        u.uVideo.value = texture
        u.uVideoAspect.value = v.videoWidth / v.videoHeight
        u.uHasVideo.value = 1
      })
      video.current = v
    }
    return () => {
      alive = false
      ;(u.uPoster.value as Texture | null)?.dispose()
      vt?.dispose()
      video.current?.pause()
      video.current = null
      material.dispose()
    }
  }, [slot, material])

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const r = slot.el.getBoundingClientRect()
    const onScreen = r.bottom > -50 && r.top < size.height + 50 && slot.reveal.v > 0.001
    m.visible = onScreen
    const v = video.current
    if (v) {
      const want = onScreen && slot.hover.v > 0.02
      if (want && v.paused) void v.play().catch(() => {})
      else if (!want && !v.paused) v.pause()
    }
    if (!onScreen) return

    // CSS pixels → world units on the z = 0 plane the camera looks at.
    const k = viewport.width / size.width
    m.position.set((r.left + r.width / 2 - size.width / 2) * k, -(r.top + r.height / 2 - size.height / 2) * k, 0)
    m.scale.set(r.width * k, r.height * k, 1)

    const u = m.material.uniforms
    u.uAspect.value = r.width / r.height
    u.uRes.value.set(r.width, r.height)
    u.uHover.value = slot.hover.v
    u.uReveal.value = slot.reveal.v
    u.uMouse.value.set(slot.mouse.x, slot.mouse.y)
    u.uTime.value = state.clock.elapsedTime
  })

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />
}
