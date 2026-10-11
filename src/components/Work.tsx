import { useGSAP } from "@gsap/react"
import { useLayoutEffect, useRef } from "react"
import { projects } from "../data"
import { gsap, reducedMotion, ScrollTrigger } from "../motion/eases"
import { splitReveal } from "../motion/splitReveal"
import { hasWebGL } from "../scene/sceneState"
import { registerSlot, type MediaSlot } from "../scene/work/registry"

type Project = (typeof projects)[number]

const touch = () => window.matchMedia("(hover: none)").matches

function Row({ p, i }: { p: Project; i: number }) {
  const row = useRef<HTMLLIElement>(null)
  const band = useRef<HTMLDivElement>(null)
  const slot = useRef<MediaSlot>(null)

  // Layout effect, declared first, so the slot exists when useGSAP below runs.
  useLayoutEffect(() => {
    if (!hasWebGL || !band.current) return
    const s: MediaSlot = {
      project: p,
      el: band.current,
      reveal: { v: reducedMotion() ? 1 : 0 },
      hover: { v: 0 },
      mouse: { x: 0.5, y: 0.5 },
    }
    slot.current = s
    const off = registerSlot(s)
    return () => {
      off()
      slot.current = null
    }
  }, [p])

  const hover = (on: boolean) => {
    const s = slot.current
    if (!s) return
    gsap.to(s.hover, {
      v: on ? 1 : 0,
      duration: reducedMotion() ? 0.01 : on ? 0.9 : 0.6,
      ease: "expo",
      overwrite: true,
    })
  }

  const track = (e: React.PointerEvent) => {
    const s = slot.current
    if (!s || e.pointerType !== "mouse") return
    const r = band.current!.getBoundingClientRect()
    s.mouse.x = gsap.utils.clamp(-0.2, 1.2, (e.clientX - r.left) / r.width)
    s.mouse.y = gsap.utils.clamp(-0.2, 1.2, 1 - (e.clientY - r.top) / r.height)
  }

  useGSAP(
    () => {
      const s = slot.current
      if (!s || reducedMotion()) return
      gsap.to(s.reveal, {
        v: 1,
        ease: "none",
        scrollTrigger: { trigger: band.current, start: "top 98%", end: "top 40%", scrub: 0.6 },
      })
      // No hover on touch: the preview floods in as the band crosses the middle.
      if (touch()) {
        ScrollTrigger.create({
          trigger: band.current,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            s.mouse.x = 0.5
            s.mouse.y = 0.5
            hover(self.isActive)
          },
        })
      }
    },
    { scope: row, dependencies: [p] },
  )

  return (
    <li
      ref={row}
      className="group border-t border-line"
      data-cursor="hover"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        track(e)
        hover(true)
      }}
      onPointerMove={track}
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(false)}
    >
      <div className="grid grid-cols-12 items-baseline gap-x-4 px-4 pt-7 pb-6 md:gap-x-6 md:px-10 md:pt-10 md:pb-8">
        <h3
          className={`col-span-12 font-display text-[clamp(2.25rem,7.5vw,8.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-[1.5vw] group-hover:text-signal md:col-span-8 ${
            i % 2 ? "md:col-start-4" : ""
          }`}
        >
          {p.title}
        </h3>
        <div
          className={`col-span-12 mt-4 md:col-span-3 md:row-start-1 md:mt-0 md:self-end ${
            i % 2 ? "md:col-start-1" : "md:col-start-10"
          }`}
        >
          <p className="text-[15px] leading-[1.5] text-ink-dim">{p.description}</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
            {p.year} · {p.tags.join(" · ")}
          </p>
          {(p.live || p.repo) && (
            <p className="mt-4 flex gap-5 font-mono text-[12px] uppercase tracking-[0.12em]">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="text-signal transition-opacity hover:opacity-70">
                  Live ↗
                </a>
              )}
              {p.repo && (
                <a href={p.repo} target="_blank" rel="noreferrer" className="text-ink transition-colors hover:text-signal">
                  Source ↗
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Painted by the WebGL layer; the fallback tint only shows without it. */}
      <div
        ref={band}
        className="aspect-[3/2] w-full md:aspect-[2.4/1]"
        style={
          hasWebGL
            ? undefined
            : { background: `radial-gradient(80% 90% at 75% 70%, ${p.accent}33, transparent 70%)` }
        }
      />
    </li>
  )
}

export function Work() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => void splitReveal(".work-title", { trigger: root.current! }), { scope: root })

  return (
    <section id="work" ref={root} className="relative py-[14vh]">
      <h2 className="work-title invisible px-4 font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em] md:px-10">
        Work
      </h2>
      <ol className="mt-12 border-b border-line">
        {projects.map((p, i) => (
          <Row key={p.slug} p={p} i={i} />
        ))}
      </ol>
    </section>
  )
}
