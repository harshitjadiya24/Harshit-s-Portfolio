import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force"
import { useEffect, useMemo, useRef, useState } from "react"
import { skillLinks, skills } from "../../data"
import { gsap, reducedMotion } from "../../motion/eases"
import { icons } from "./icons"

type Node = SimulationNodeDatum & {
  id: string
  hub: boolean
  w: number
  h: number
}
type Link = SimulationLinkDatum<Node> & { cross: boolean }

const groups = [...new Set(skills.map((s) => s.group))]
const PAD = 10

function buildGraph() {
  const nodes: Node[] = [
    ...groups.map((g) => ({ id: g, hub: true, w: 0, h: 0 })),
    ...skills.map((s) => ({ id: s.name, hub: false, w: 0, h: 0 })),
  ]
  const links: Link[] = [
    ...skills.map((s) => ({ source: s.name, target: s.group, cross: false })),
    ...skillLinks.map(([a, b]) => ({ source: a, target: b, cross: true })),
  ]
  return { nodes, links }
}

// d3 mutates nodes in place every tick, so the graph lives outside React.
const { nodes, links } = buildGraph()

/** Axis-aligned box collision: pills are wide, so circles would leave gaps or overlap. */
function rectCollide(nodes: Node[]) {
  return (alpha: number) => {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = b.x! - a.x!
        const dy = b.y! - a.y!
        const ox = (a.w + b.w) / 2 + PAD - Math.abs(dx)
        const oy = (a.h + b.h) / 2 + PAD - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        const k = 0.5 * Math.min(1, alpha * 6 + 0.2)
        if (ox < oy) {
          const s = Math.sign(dx || Math.random() - 0.5) * ox * k
          a.vx! -= s
          b.vx! += s
        } else {
          const s = Math.sign(dy || Math.random() - 0.5) * oy * k
          a.vy! -= s
          b.vy! += s
        }
      }
    }
  }
}

/** Nodes shy away from a nearby cursor, so the graph feels alive before it's touched. */
function cursorRepel(nodes: Node[], cursor: { x: number; y: number; on: boolean }) {
  return (alpha: number) => {
    if (!cursor.on) return
    for (const n of nodes) {
      if (n.fx != null) continue
      const dx = n.x! - cursor.x
      const dy = n.y! - cursor.y
      const d = Math.hypot(dx, dy)
      if (d > 150 || d < 1) continue
      const f = ((150 - d) / 150) ** 2 * 3.2 * Math.max(alpha, 0.05)
      n.vx! += (dx / d) * f
      n.vy! += (dy / d) * f
    }
  }
}

/**
 * Draggable force graph of the stack. DOM nodes (crisp text and icons) are
 * moved with transforms from the d3 tick; edges are one SVG. Group hubs anchor
 * their skills, and cross-links tie tools that get used together.
 */
export function SkillGraph() {
  const box = useRef<HTMLDivElement>(null)
  const nodeEls = useRef(new Map<string, HTMLElement>())
  const lineEls = useRef<(SVGLineElement | null)[]>([])
  const [lit, setLit] = useState<string | null>(null)

  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const l of links) {
      const a = l.source as string
      const b = l.target as string
      if (!m.has(a)) m.set(a, new Set())
      if (!m.has(b)) m.set(b, new Set())
      m.get(a)!.add(b)
      m.get(b)!.add(a)
    }
    return m
  }, [])

  const sim = useRef<Simulation<Node, Link>>(null)
  const redraw = useRef(() => {})

  useEffect(() => {
    const el = box.current!
    const reduce = reducedMotion()
    const cursor = { x: 0, y: 0, on: false }
    let W = el.clientWidth
    let H = el.clientHeight

    for (const n of nodes) {
      const ne = nodeEls.current.get(n.id)!
      n.w = ne.offsetWidth
      n.h = ne.offsetHeight
      // Burst outward from the centre on first reveal.
      n.x = W / 2 + (Math.random() - 0.5) * 40
      n.y = H / 2 + (Math.random() - 0.5) * 40
    }

    const draw = () => {
      for (const n of nodes) {
        n.x = Math.max(n.w / 2, Math.min(W - n.w / 2, n.x!))
        n.y = Math.max(n.h / 2, Math.min(H - n.h / 2, n.y!))
        const ne = nodeEls.current.get(n.id)!
        ne.style.transform = `translate3d(${n.x! - n.w / 2}px, ${n.y! - n.h / 2}px, 0)`
      }
      links.forEach((l, i) => {
        const line = lineEls.current[i]
        if (!line) return
        const s = l.source as Node
        const t = l.target as Node
        line.setAttribute("x1", String(s.x))
        line.setAttribute("y1", String(s.y))
        line.setAttribute("x2", String(t.x))
        line.setAttribute("y2", String(t.y))
      })
    }

    redraw.current = draw

    const wide = () => W > 760
    const s = forceSimulation(nodes)
      .force(
        "link",
        forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance((l) => (l.cross ? 170 : 110) * (wide() ? 1 : 0.7))
          .strength((l) => (l.cross ? 0.08 : 0.55)),
      )
      .force("charge", forceManyBody<Node>().strength((d) => (d.hub ? -900 : -260)))
      .force("x", forceX<Node>(() => W / 2).strength(wide() ? 0.035 : 0.09))
      .force("y", forceY<Node>(() => H / 2).strength(0.07))
      .force("collide", rectCollide(nodes))
      .force("cursor", cursorRepel(nodes, cursor))
      .velocityDecay(0.32)
      .alphaDecay(0.018)
      .on("tick", draw)
      .stop()
    sim.current = s

    if (reduce) {
      s.tick(320)
      draw()
    } else {
      gsap.set([...nodeEls.current.values()], { opacity: 0 })
    }

    // Only simulate while visible; the first entry is the reveal.
    let revealed = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (reduce) return
        if (e.isIntersecting) {
          if (!revealed) {
            revealed = true
            s.alpha(1)
            gsap.fromTo(
              [...nodeEls.current.values()],
              { opacity: 0, filter: "blur(10px)" },
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.2,
                ease: "expo",
                stagger: 0.03,
                // Hand opacity back to the lit/dim classes once in.
                clearProps: "opacity,filter",
              },
            )
          }
          s.restart()
        } else s.stop()
      },
      { threshold: 0.15 },
    )
    io.observe(el)

    const ro = new ResizeObserver(() => {
      W = el.clientWidth
      H = el.clientHeight
      if (reduce) {
        s.tick(120)
        draw()
      } else if (revealed) s.alpha(0.4).restart()
    })
    ro.observe(el)

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      cursor.x = e.clientX - r.left
      cursor.y = e.clientY - r.top
      cursor.on = e.pointerType === "mouse"
      if (cursor.on && !reduce && s.alpha() < 0.08) s.alpha(0.08).restart()
    }
    const leave = () => {
      cursor.on = false
    }
    el.addEventListener("pointermove", move, { passive: true })
    el.addEventListener("pointerleave", leave)

    return () => {
      s.stop()
      io.disconnect()
      ro.disconnect()
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    }
  }, [])

  const grab = (n: Node) => (e: React.PointerEvent<HTMLElement>) => {
    const s = sim.current
    if (!s || e.button !== 0) return
    e.preventDefault()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    const r = box.current!.getBoundingClientRect()
    const off = { x: n.x! - (e.clientX - r.left), y: n.y! - (e.clientY - r.top) }
    let last = { x: e.clientX, y: e.clientY, t: performance.now() }
    let vel = { x: 0, y: 0 }
    n.fx = n.x
    n.fy = n.y
    s.alphaTarget(0.3).restart()
    setLit(n.id)

    const drag = (ev: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max(1, now - last.t)
      vel = { x: ((ev.clientX - last.x) / dt) * 16, y: ((ev.clientY - last.y) / dt) * 16 }
      last = { x: ev.clientX, y: ev.clientY, t: now }
      n.fx = ev.clientX - r.left + off.x
      n.fy = ev.clientY - r.top + off.y
      if (reducedMotion()) {
        n.x = n.fx
        n.y = n.fy
        s.tick()
        redraw.current()
      }
    }
    const drop = () => {
      n.fx = null
      n.fy = null
      // Fling: release carries the pointer's momentum into the simulation.
      n.vx = vel.x
      n.vy = vel.y
      s.alphaTarget(0)
      if (!reducedMotion()) s.alpha(Math.max(s.alpha(), 0.5)).restart()
      setLit(null)
      target.removeEventListener("pointermove", drag)
      target.removeEventListener("pointerup", drop)
      target.removeEventListener("pointercancel", drop)
    }
    target.addEventListener("pointermove", drag)
    target.addEventListener("pointerup", drop)
    target.addEventListener("pointercancel", drop)
  }

  const isLit = (id: string) => !lit || id === lit || !!neighbours.get(lit)?.has(id)

  return (
    <div
      ref={box}
      aria-hidden
      className="skill-graph relative h-[78svh] min-h-[520px] w-full select-none"
      data-active={lit ? "" : undefined}
    >
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
        {links.map((l, i) => {
          const a = typeof l.source === "string" ? l.source : (l.source as Node).id
          const b = typeof l.target === "string" ? l.target : (l.target as Node).id
          const on = !!lit && (a === lit || b === lit)
          return (
            <line
              key={i}
              ref={(el) => {
                lineEls.current[i] = el
              }}
              className="transition-[stroke,opacity] duration-500 ease-[var(--ease-expo)]"
              stroke={on ? "var(--color-signal)" : "var(--color-ink)"}
              strokeOpacity={on ? 0.9 : lit ? 0.05 : l.cross ? 0.1 : 0.2}
              strokeWidth={on ? 1.5 : 1}
              strokeDasharray={l.cross ? "2 6" : undefined}
            />
          )
        })}
      </svg>

      {nodes.map((n) => {
        const skill = skills.find((s) => s.name === n.id)
        const icon = skill && "icon" in skill ? icons[skill.icon] : undefined
        const on = isLit(n.id)
        return (
          <div
            key={n.id}
            ref={(el) => {
              if (el) nodeEls.current.set(n.id, el)
            }}
            onPointerDown={grab(n)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setLit(n.id)}
            onPointerLeave={(e) => e.pointerType === "mouse" && e.buttons === 0 && setLit(null)}
            data-cursor="hover"
            className={[
              "absolute top-0 left-0 cursor-grab touch-none whitespace-nowrap will-change-transform active:cursor-grabbing",
              "transition-[opacity,color] duration-500 ease-[var(--ease-expo)]",
              on ? "opacity-100" : "opacity-25",
              n.hub
                ? "font-display text-[clamp(2rem,4.6vw,4.25rem)] font-semibold uppercase leading-none tracking-[-0.03em]"
                : "flex items-center gap-2.5 rounded-full border bg-bg/70 px-4 py-2.5 font-mono text-[12px] tracking-[0.04em] md:text-[13px]",
              n.hub && (lit === n.id ? "text-signal" : "text-ink-mute"),
              !n.hub && (lit === n.id ? "border-signal text-signal" : "border-line text-ink"),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {icon && (
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current" aria-hidden>
                <path d={icon.path} />
              </svg>
            )}
            {n.id}
          </div>
        )
      })}
    </div>
  )
}
