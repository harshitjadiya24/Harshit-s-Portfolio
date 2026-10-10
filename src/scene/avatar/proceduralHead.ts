import type { FaceCloud } from "./cloud"

type V = [number, number, number]

const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

function ellipsoid(px: number, py: number, pz: number, rx: number, ry: number, rz: number) {
  const k0 = Math.hypot(px / rx, py / ry, pz / rz)
  const k1 = Math.hypot(px / (rx * rx), py / (ry * ry), pz / (rz * rz))
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1
}

function capsule(p: V, a: V, b: V, r: number) {
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]]
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const h = Math.min(1, Math.max(0, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2)))
  return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r
}

/** A sculpted bust: skull, jaw, nose ridge, brow, sockets, lips, neck, shoulders. */
function sdf(x: number, y: number, z: number) {
  const ax = Math.abs(x)
  let d = ellipsoid(x, y - 0.32, z, 0.74, 0.92, 0.82)
  d = smin(d, ellipsoid(x, y + 0.28, z - 0.12, 0.56, 0.52, 0.64), 0.32)
  d = smin(d, ellipsoid(x, y - 0.42, z - 0.5, 0.58, 0.16, 0.28), 0.12) // brow
  d = smin(d, capsule([x, y, z], [0, 0.32, 0.76], [0, -0.04, 0.9], 0.075), 0.12) // nose ridge
  d = smin(d, ellipsoid(x, y + 0.06, z - 0.86, 0.13, 0.07, 0.07), 0.06) // nose tip
  d = smin(d, ellipsoid(x, y + 0.3, z - 0.72, 0.2, 0.05, 0.06), 0.06) // lips
  d = smax(d, -ellipsoid(ax - 0.27, y - 0.24, z - 0.78, 0.15, 0.09, 0.12), 0.08) // sockets
  d = smin(d, ellipsoid(ax - 0.27, y - 0.23, z - 0.66, 0.085, 0.06, 0.06), 0.02) // eyes
  d = smin(d, ellipsoid(ax - 0.74, y - 0.18, z + 0.02, 0.07, 0.18, 0.1), 0.08) // ears
  d = smin(d, capsule([x, y, z], [0, -0.55, -0.08], [0, -1.25, -0.08], 0.3), 0.18) // neck
  d = smin(d, ellipsoid(x, y + 1.45, z + 0.1, 1.45, 0.38, 0.5), 0.3) // shoulders
  return Math.max(d, -1.62 - y) // cut the bust flat
}

/**
 * Fallback avatar while no portrait exists. Random points are Newton-projected
 * onto the SDF surface, then thinned on back-facing regions so the cloud
 * reads as a face from the front rather than a uniform shell.
 */
export function proceduralHead(count: number): FaceCloud {
  const positions = new Float32Array(count * 3)
  const brightness = new Float32Array(count)
  const e = 0.002
  const light = [-0.35, 0.45, 0.85]
  const ll = Math.hypot(...light)
  let n = 0
  let guard = 0

  while (n < count && guard++ < count * 30) {
    let x = (Math.random() * 2 - 1) * 1.5
    let y = Math.random() * 3 - 1.65
    let z = (Math.random() * 2 - 1) * 1.0
    let nx = 0
    let ny = 0
    let nz = 0
    let d = 1
    for (let it = 0; it < 6; it++) {
      d = sdf(x, y, z)
      nx = sdf(x + e, y, z) - sdf(x - e, y, z)
      ny = sdf(x, y + e, z) - sdf(x, y - e, z)
      nz = sdf(x, y, z + e) - sdf(x, y, z - e)
      const l = Math.hypot(nx, ny, nz) || 1
      nx /= l
      ny /= l
      nz /= l
      x -= nx * d
      y -= ny * d
      z -= nz * d
    }
    if (Math.abs(d) > 0.01 || y < -1.62) continue
    // Favour the camera-facing hemisphere and the facial plane.
    const facing = nz * 0.5 + 0.5
    const facial = Math.max(0, 1 - Math.hypot(x / 0.55, (y - 0.05) / 0.7)) * (nz > 0 ? 1 : 0)
    if (Math.random() > 0.08 + facing * 0.6 + facial * 0.6) continue

    const lambert = Math.max(0, (nx * light[0] + ny * light[1] + nz * light[2]) / ll)
    const rim = Math.pow(1 - Math.abs(nz), 3)
    positions[n * 3] = x
    positions[n * 3 + 1] = y
    positions[n * 3 + 2] = z
    brightness[n] = Math.min(1, 0.22 + lambert * 0.62 + rim * 0.3 + facial * 0.22)
    n++
  }

  return { positions, brightness, count: n, source: "procedural" }
}
