import { currentSlots } from "../work/registry"

type Rect = { l: number; t: number; r: number; b: number }
type Point = { x: number; y: number }

const TEXT = "#work h2, #work h3, #work li p, #work li a"
const NAV = 72
const MARGIN = 24

let textEls: HTMLElement[] = []

/**
 * Screen rects of everything readable in the Work section: DOM type, plus the
 * title-and-tags block each poster paints in its top-left corner.
 */
function obstacles(vh: number): Rect[] {
  // Re-query if Work re-rendered (HMR, data changes) and the cache went stale.
  if (!textEls[0]?.isConnected) textEls = [...document.querySelectorAll<HTMLElement>(TEXT)]
  const out: Rect[] = []
  for (const el of textEls) {
    const r = el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > vh || !r.width) continue
    out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom })
  }
  for (const s of currentSlots()) {
    const r = s.el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > vh) continue
    out.push({ l: r.left, t: r.top, r: r.left + r.width * 0.55, b: r.top + r.height * 0.3 })
  }
  return out
}

function overlap(a: Rect, b: Rect) {
  const w = Math.min(a.r, b.r) - Math.max(a.l, b.l)
  const h = Math.min(a.b, b.b) - Math.max(a.t, b.t)
  return w > 0 && h > 0 ? w * h : 0
}

let target: Point | null = null

/**
 * The spot (CSS px, centre) where a shape of `radius` covers the least text.
 * Sticky: it only moves when another spot is clearly better, so the shape
 * glides between clearings rather than twitching on every scroll tick.
 */
export function freeSpot(radius: number, vw: number, vh: number): Point {
  const rects = obstacles(vh)
  const box = (p: Point): Rect => ({ l: p.x - radius, t: p.y - radius, r: p.x + radius, b: p.y + radius })
  const area = (2 * radius) ** 2
  const cost = (p: Point) => {
    let c = 0
    for (const r of rects) c += overlap(box(p), r)
    return c / area
  }

  const x0 = radius + MARGIN
  const x1 = vw - radius - MARGIN
  const y0 = Math.min(NAV + radius, vh / 2)
  const y1 = Math.max(vh - radius - MARGIN, y0)
  let best: Point = { x: x1, y: (y0 + y1) / 2 }
  let bestCost = Infinity
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 3; j++) {
      const p = { x: x0 + ((x1 - x0) * i) / 6, y: y0 + ((y1 - y0) * j) / 3 }
      // Small pull toward the current spot breaks ties without moving.
      const c = cost(p) + (target ? Math.hypot(p.x - target.x, p.y - target.y) / vw : 0) * 0.08
      if (c < bestCost) {
        bestCost = c
        best = p
      }
    }
  }
  if (!target || bestCost < cost(target) - 0.04) target = best
  return target
}
