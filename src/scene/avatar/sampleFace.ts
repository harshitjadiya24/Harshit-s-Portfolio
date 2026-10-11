import type { FaceCloud } from "./cloud"

/** Longest side the portrait is read at. Full-length shots keep their small face this way. */
const MAX_RES = 900
/** Fit box in avatar units (the hero shows ~3.3 units per viewport height). */
const MAX_H = 2.9
/** Keeps wide busts in the right half, clear of the hero type. */
const MAX_W = 2.25

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error("empty")))
    img.onerror = () => reject(new Error(`no portrait at ${src}`))
    img.src = src
  })
}

/** Separable box blur, a few passes ≈ gaussian. Used to round the silhouette into a pillow. */
function blur(src: Float32Array, w: number, h: number, r: number, passes = 3) {
  let a = src.slice()
  const b = new Float32Array(a.length)
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0
      for (let x = -r; x <= r; x++) acc += a[y * w + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        b[y * w + x] = acc / (2 * r + 1)
        acc += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++) acc += b[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc / (2 * r + 1)
        acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]
      }
    }
  }
  return a
}

/**
 * Turns a portrait into a point cloud. The subject comes from the image's
 * alpha when it has been cut out (public/face.webp is), else from distance to
 * the corner background tone. Points are stippled: density follows a
 * local-contrast tone, so the face reads like an engraving in light.
 * Depth: the head is found above the shoulder line and bulges toward the
 * camera; the body is a softer pillow set behind it.
 */
export async function sampleFace(src: string, count: number): Promise<FaceCloud> {
  const img = await loadImage(src)
  // Read at native resolution (capped): downscaling first throws away the
  // few pixels a face has in a full-length photo.
  const GRID = Math.min(MAX_RES, Math.max(img.naturalWidth, img.naturalHeight))
  const aspect = img.naturalWidth / img.naturalHeight
  const w = aspect >= 1 ? GRID : Math.round(GRID * aspect)
  const h = aspect >= 1 ? Math.round(GRID / aspect) : GRID

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("2d context unavailable")
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const N = w * h
  const lum = new Float32Array(N)
  const fg = new Float32Array(N)
  let cutout = false
  for (let i = 0; i < N; i++) {
    lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255
    if (data[i * 4 + 3] < 250) cutout = true
  }
  if (cutout) {
    for (let i = 0; i < N; i++) fg[i] = data[i * 4 + 3] / 255
  } else {
    // No alpha: anything close to the corner tone is background.
    const k = 6
    let bgSum = 0
    for (const [cx, cy] of [[0, 0], [w - k, 0], [0, h - k], [w - k, h - k]]) {
      for (let y = cy; y < cy + k; y++) for (let x = cx; x < cx + k; x++) bgSum += lum[y * w + x]
    }
    const bg = bgSum / (4 * k * k)
    for (let i = 0; i < N; i++) fg[i] = Math.min(1, Math.max(0, (Math.abs(lum[i] - bg) - 0.05) * 6))
  }

  // Silhouette widths per row locate the head: it ends where the shoulders flare.
  const widths = new Float32Array(h)
  let top = -1
  for (let y = 0; y < h; y++) {
    let c = 0
    for (let x = 0; x < w; x++) c += fg[y * w + x] > 0.5 ? 1 : 0
    widths[y] = c
    if (top < 0 && c > 2) top = y
  }
  if (top < 0) throw new Error("portrait has no separable subject")
  // Walk down from the crown: the shoulder line is the first row that flares
  // well past the widest head row so far. Works for busts and full figures.
  const span = h - top
  let headW = 0
  let shoulder = Math.round(top + span * 0.6)
  for (let y = top; y < h; y++) {
    if (y > top + span * 0.04 && headW > 0 && widths[y] > headW * 1.4) {
      shoulder = y
      break
    }
    headW = Math.max(headW, widths[y])
  }
  let hx = 0
  let hy = 0
  let hm = 0
  for (let y = top; y < shoulder; y++) {
    for (let x = 0; x < w; x++) {
      const f = fg[y * w + x]
      if (f > 0.5) {
        hx += x
        hy += y
        hm++
      }
    }
  }
  if (!hm) throw new Error("portrait has no head region")
  hx /= hm
  hy /= hm
  const rx = (headW / 2) * 1.08
  const ry = ((shoulder - top) / 2) * 1.1

  const pillow = blur(fg, w, h, Math.round(GRID * 0.04))

  // Tone with local contrast lifted, so eyes and brows sink and cheekbones,
  // nose and teeth catch light. Only foreground feeds the local mean.
  const lumFg = new Float32Array(N)
  for (let i = 0; i < N; i++) lumFg[i] = lum[i] * fg[i]
  const meanNum = blur(lumFg, w, h, Math.round(GRID * 0.025), 2)
  const meanDen = blur(fg, w, h, Math.round(GRID * 0.025), 2)
  const tone = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const local = meanDen[i] > 1e-3 ? meanNum[i] / meanDen[i] : lum[i]
    const t = 0.5 * lum[i] + 0.5 * (0.5 + (lum[i] - local) * 3.2)
    tone[i] = Math.min(1, Math.max(0, t))
  }

  // Form lighting from the upper left: the head as an ellipsoid, the body as
  // the rounded pillow. Lit sides get brighter and denser, so it reads as volume.
  const light = [-0.45, -0.55, 0.7]
  const ll = Math.hypot(light[0], light[1], light[2])
  const shade = new Float32Array(N)
  const headMask = new Float32Array(N)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const ex = (x - hx) / rx
      const ey = (y - hy) / ry
      const head = 1 - ex * ex - ey * ey
      let nx: number, ny: number, nz: number
      if (head > 0) {
        nx = ex
        ny = ey
        nz = Math.sqrt(head)
        headMask[i] = Math.min(1, head * 4)
      } else {
        const k = GRID * 0.6
        nx = -(pillow[i + 1] - pillow[i - 1]) * k
        ny = -(pillow[i + w] - pillow[i - w]) * k
        nz = 1
      }
      const nl = Math.hypot(nx, ny, nz) || 1
      const lambert = Math.max(0, (nx * light[0] + ny * light[1] + nz * light[2]) / (nl * ll))
      shade[i] = 0.35 + 0.75 * lambert
    }
  }

  // Stipple: dot density follows tone (light reads as light). A little edge
  // term keeps the jaw and hairline crisp; the body is thinned and the head
  // boosted so the face gets the detail.
  const weight = new Float32Array(N)
  let maxW = 0
  for (let y = 1; y < h - 1; y++) {
    // Thin the body, and let it dissolve toward the photo's bottom edge
    // instead of ending in a hard crop line.
    const fadeOut = Math.min(1, Math.max(0, (h - y) / (h * 0.22)))
    const body = (y > shoulder ? 0.5 : 1) * fadeOut * fadeOut
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx =
        -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1]
      const gy =
        -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1]
      const edge = Math.min(1, Math.hypot(gx, gy) * 1.4)
      const boost = 1 + headMask[i] * 2.4
      // Fill light on the face: backlit portraits leave it in shadow, so lift
      // tone inside the head (gamma < 1) without flattening its contrast.
      if (headMask[i] > 0) tone[i] = tone[i] ** (1 - 0.35 * headMask[i])
      const wgt = fg[i] * body * boost * (0.6 + 0.5 * shade[i]) * (0.06 + 0.78 * tone[i] ** 1.7 + 0.16 * edge)
      weight[i] = wgt
      if (wgt > maxW) maxW = wgt
    }
  }
  if (maxW === 0) throw new Error("portrait has no separable subject")

  const positions = new Float32Array(count * 3)
  const brightness = new Float32Array(count)
  const scale = Math.min(MAX_H / h, MAX_W / w)
  let n = 0
  let guard = 0
  while (n < count && guard++ < count * 400) {
    const x = Math.random() * (w - 2) + 1
    const y = Math.random() * (h - 2) + 1
    const i = (y | 0) * w + (x | 0)
    if (Math.random() * maxW > weight[i]) continue
    const ex = (x - hx) / rx
    const ey = (y - hy) / ry
    const head = 1 - ex * ex - ey * ey
    // Shallow relief in proportion to the head's size: deep relief makes the
    // perspective camera magnify the face centre and widen it.
    const headZ = head > 0 ? 0.04 + Math.sqrt(head) * Math.min(0.3, rx * scale * 0.4) : -1
    const bodyZ = pillow[i] * Math.min(0.34, rx * scale * 1.2) - 0.1
    positions[n * 3] = (x - hx) * scale
    // Figure centred vertically; x pivots on the head so turns feel natural.
    positions[n * 3 + 1] = ((top + h) / 2 - y) * scale
    positions[n * 3 + 2] = Math.max(headZ, bodyZ) + (lum[i] - 0.5) * 0.1
    // Dark hair and the jacket keep a floor so they read as form, not holes.
    brightness[n] = Math.min(1, (0.14 + tone[i] * 0.86) * shade[i])
    n++
  }

  return { positions, brightness, count: n, source: "photo" }
}
