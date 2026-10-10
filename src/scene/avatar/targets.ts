/**
 * Alternate shapes the face cloud morphs into on scroll. Every point gets a
 * slot in each shape, so the morph is a pure per-vertex mix in the shader.
 * Coordinates share the avatar's local space (head spans roughly ±1.5).
 */

export type MorphTargets = {
  /** xyz on the neural graph. */
  graph: Float32Array
  /** x = position along the edge (0–1, or -1 on a node), y = brightness. */
  graphMeta: Float32Array
  /** xyz on the data cube. */
  cube: Float32Array
  /** Brightness on the cube: edges > lattice > faces. */
  cubeBright: Float32Array
}

const LAYERS = [6, 9, 11, 9, 6]
const SPAN_X = 3.4
const SPAN_Y = 2.3
const CUBE = 0.95
const GRID = 9

type V3 = [number, number, number]

function graphNodes(): V3[][] {
  return LAYERS.map((n, li) => {
    const x = (li / (LAYERS.length - 1) - 0.5) * SPAN_X
    // Layers bow toward the camera at the centre so the net reads in depth.
    const bow = Math.cos((li / (LAYERS.length - 1) - 0.5) * Math.PI) * 0.35
    return Array.from({ length: n }, (_, i) => {
      const y = (n === 1 ? 0 : i / (n - 1) - 0.5) * SPAN_Y * (0.6 + n / 22)
      const z = Math.sin(i * 2.4 + li) * 0.45 + bow
      return [x, y, z] as V3
    })
  })
}

/** Point inside a sphere, biased to the shell so nodes read as bright beads. */
function bead(c: V3, r: number, out: Float32Array, i: number) {
  const u = Math.random() * 2 - 1
  const th = Math.random() * Math.PI * 2
  const rr = r * Math.cbrt(0.35 + Math.random() * 0.65)
  const s = Math.sqrt(1 - u * u)
  out[i * 3] = c[0] + rr * s * Math.cos(th)
  out[i * 3 + 1] = c[1] + rr * u
  out[i * 3 + 2] = c[2] + rr * s * Math.sin(th)
}

function buildGraph(count: number) {
  const graph = new Float32Array(count * 3)
  const meta = new Float32Array(count * 2)
  const layers = graphNodes()
  const nodes = layers.flat()
  const edges: [V3, V3][] = []
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) for (const b of layers[l + 1]) edges.push([a, b])
  }

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.2) {
      bead(nodes[(Math.random() * nodes.length) | 0], 0.05, graph, i)
      meta[i * 2] = -1
      meta[i * 2 + 1] = 0.95
      continue
    }
    const [a, b] = edges[(Math.random() * edges.length) | 0]
    const t = Math.random()
    const j = 0.006
    graph[i * 3] = a[0] + (b[0] - a[0]) * t + (Math.random() - 0.5) * j
    graph[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * j
    graph[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + (Math.random() - 0.5) * j
    meta[i * 2] = t
    meta[i * 2 + 1] = 0.5 + Math.random() * 0.25
  }
  return { graph, meta }
}

function buildCube(count: number) {
  const cube = new Float32Array(count * 3)
  const bright = new Float32Array(count)
  const s = CUBE
  const step = (2 * s) / GRID
  const snap = () => -s + Math.round(Math.random() * GRID) * step
  const free = () => (Math.random() * 2 - 1) * s
  const sign = () => (Math.random() < 0.5 ? -s : s)

  for (let i = 0; i < count; i++) {
    const r = Math.random()
    let p: V3
    let b: number
    if (r < 0.4) {
      // The 12 edges: one free axis, two pinned to ±s.
      const axis = (Math.random() * 3) | 0
      p = [sign(), sign(), sign()]
      p[axis] = free()
      b = 0.9
    } else if (r < 0.75) {
      // Grid lines on the six faces.
      const axis = (Math.random() * 3) | 0
      p = [snap(), snap(), snap()]
      p[axis] = sign()
      p[(axis + 1 + ((Math.random() * 2) | 0)) % 3] = free()
      b = 0.42
    } else {
      // Interior lattice voxels: tight clusters, the "data".
      const j = 0.018
      p = [snap() + (Math.random() - 0.5) * j, snap() + (Math.random() - 0.5) * j, snap() + (Math.random() - 0.5) * j]
      p = p.map((v) => v * 0.78) as V3
      b = 0.3 + Math.random() * 0.5
    }
    cube[i * 3] = p[0]
    cube[i * 3 + 1] = p[1]
    cube[i * 3 + 2] = p[2]
    bright[i] = b
  }
  return { cube, bright }
}

export function buildMorphTargets(count: number): MorphTargets {
  const { graph, meta } = buildGraph(count)
  const { cube, bright } = buildCube(count)
  return { graph, graphMeta: meta, cube, cubeBright: bright }
}
