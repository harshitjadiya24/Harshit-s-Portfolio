import { CanvasTexture, SRGBColorSpace, TextureLoader, VideoTexture, type Texture } from "three"
import { palette } from "../sceneState"
import type { Project } from "./registry"

const W = 1600
const H = 760

/**
 * Typographic poster for a project with no real thumbnail yet: the name set
 * huge in the accent and cropped by the frame, title and tags in ink and mono.
 */
async function poster(p: Project): Promise<Texture> {
  const accent = p.accent
  await Promise.all([
    document.fonts.load('700 400px "Clash Display"'),
    document.fonts.load('500 24px "JetBrains Mono"'),
  ])
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const g = c.getContext("2d")!

  g.fillStyle = palette.bg
  g.fillRect(0, 0, W, H)
  const glow = g.createRadialGradient(W * 0.78, H * 0.62, 0, W * 0.78, H * 0.62, W * 0.6)
  glow.addColorStop(0, `${accent}38`)
  glow.addColorStop(1, `${accent}00`)
  g.fillStyle = glow
  g.fillRect(0, 0, W, H)

  // Fine measured rule lines: the poster is a spec sheet, not a picture.
  g.strokeStyle = `${palette.ink}14`
  g.lineWidth = 1
  for (let x = 80; x < W; x += 80) {
    g.beginPath()
    g.moveTo(x + 0.5, H - 40)
    g.lineTo(x + 0.5, H - (x % 400 === 0 ? 64 : 52))
    g.stroke()
  }

  // The first word of the title, huge in the accent, bleeding off the bottom edge.
  g.font = '700 470px "Clash Display"'
  g.textBaseline = "alphabetic"
  g.textAlign = "left"
  g.fillStyle = accent
  g.fillText(p.title.split(" ")[0].toUpperCase(), 52, H + 118)

  g.fillStyle = palette.ink
  g.font = '600 64px "Clash Display"'
  g.fillText(p.title.toUpperCase(), 72, 128)

  g.font = '500 22px "JetBrains Mono"'
  g.fillStyle = palette.dim
  g.fillText(p.tags.join("  ·  ").toUpperCase(), 76, 180)

  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function image(src: string) {
  return new Promise<Texture>((resolve, reject) =>
    new TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = SRGBColorSpace
        resolve(t)
      },
      undefined,
      reject,
    ),
  )
}

export async function loadPoster(p: Project) {
  if (p.poster) {
    try {
      return await image(p.poster)
    } catch {
      /* fall through to the generated poster */
    }
  }
  return poster(p)
}

/** Muted inline video; the caller plays it only while the preview is showing. */
export function loadVideo(src: string) {
  const v = document.createElement("video")
  v.src = src
  v.muted = true
  v.loop = true
  v.playsInline = true
  v.preload = "metadata"
  v.crossOrigin = "anonymous"
  const tex = new VideoTexture(v)
  tex.colorSpace = SRGBColorSpace
  return { video: v, texture: tex }
}

/** Width / height of whatever a texture holds, for cover-fit in the shader. */
export function aspectOf(t: Texture) {
  const img = t.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number }
  const w = img.videoWidth || img.width || W
  const h = img.videoHeight || img.height || H
  return w / h
}
