import type { FaceCloud } from "./cloud"

const GRID = 256
const HEIGHT = 2.8

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error("empty")))
    img.onerror = () => reject(new Error(`no portrait at ${src}`))
    img.src = src
  })
}

/**
 * Turns a portrait into a point cloud. Points are rejection-sampled with a
 * weight of foreground × (edge + tone), so eyes, brows, lips and the jaw
 * outline stay dense while flat skin thins out. Depth is faked from
 * luminance plus a spherical bulge around the subject's centroid.
 */
export async function sampleFace(src: string, count: number): Promise<FaceCloud> {
  const img = await loadImage(src)
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

  const lum = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255
  }

  // Background tone from the four corners; anything close to it is not the subject.
  const k = 6
  let bgSum = 0
  for (const [cx, cy] of [[0, 0], [w - k, 0], [0, h - k], [w - k, h - k]]) {
    for (let y = cy; y < cy + k; y++) for (let x = cx; x < cx + k; x++) bgSum += lum[y * w + x]
  }
  const bg = bgSum / (4 * k * k)

  const weight = new Float32Array(w * h)
  let maxW = 0
  let mx = 0
  let my = 0
  let mass = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx =
        -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1]
      const gy =
        -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1]
      const edge = Math.min(1, Math.hypot(gx, gy) * 1.4)
      const fg = Math.min(1, Math.max(0, (Math.abs(lum[i] - bg) - 0.05) * 6))
      const wgt = fg * (0.18 + 0.55 * edge + 0.27 * lum[i])
      weight[i] = wgt
      if (wgt > maxW) maxW = wgt
      if (fg > 0.5) {
        mx += x
        my += y
        mass++
      }
    }
  }
  if (mass < w * h * 0.02 || maxW === 0) throw new Error("portrait has no separable subject")
  mx /= mass
  my /= mass
  const radius = Math.sqrt(mass / Math.PI)

  const positions = new Float32Array(count * 3)
  const brightness = new Float32Array(count)
  const scale = HEIGHT / h
  let n = 0
  let guard = 0
  while (n < count && guard++ < count * 400) {
    const x = Math.random() * (w - 2) + 1
    const y = Math.random() * (h - 2) + 1
    const i = (y | 0) * w + (x | 0)
    if (Math.random() * maxW > weight[i]) continue
    const r = Math.min(1, Math.hypot(x - mx, y - my) / (radius * 1.15))
    const bulge = Math.sqrt(1 - r * r) * 0.55
    positions[n * 3] = (x - mx) * scale
    positions[n * 3 + 1] = (my - y) * scale + 0.1
    positions[n * 3 + 2] = bulge + (lum[i] - 0.5) * 0.28
    brightness[n] = lum[i]
    n++
  }

  return { positions, brightness, count: n, source: "photo" }
}
