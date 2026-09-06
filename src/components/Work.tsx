import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { projects } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

export function Work() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".work-head", {
        scrollTrigger: { trigger: root.current, start: "top 75%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
      })
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: "top 88%" },
          y: 60,
          opacity: 0,
          duration: 0.85,
          delay: i * 0.04,
          ease: "power3.out",
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      id="work"
      ref={root}
      className="relative z-10 px-5 py-24 md:px-10"
      onMouseEnter={() => setExpression("wow")}
    >
      <div className="work-head mb-14 flex items-end justify-between gap-6">
        <h2 className="display text-6xl md:text-8xl">
          Selected <span className="italic text-[#6ee7ff]">work</span>
        </h2>
        <p className="hidden max-w-xs text-sm text-[#9a9588] md:block">
          Real builds from the lab — vision, agents, and interfaces that react.
        </p>
      </div>
      <div className="grid gap-4">
        {projects.map((p) => (
          <article
            key={p.title}
            className="project-card glass group grid gap-6 rounded-[28px] p-6 md:grid-cols-[80px_1.3fr_1fr_auto] md:items-center md:p-8"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              const rx = ((e.clientY - r.top) / r.height - 0.5) * -6
              const ry = ((e.clientX - r.left) / r.width - 0.5) * 8
              e.currentTarget.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "perspective(900px) rotateX(0) rotateY(0)"
            }}
          >
            <p className="display text-3xl" style={{ color: p.accent }}>
              {p.index}
            </p>
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-2xl md:text-3xl">{p.title}</h3>
                <span className="mono text-[11px] text-[#9a9588]">{p.year}</span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#cfcab8]">
                {p.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] tracking-wide text-[#cfcab8]"
                >
                  {t}
                </span>
              ))}
            </div>
            <span
              className="hidden h-12 w-12 place-items-center rounded-full border border-white/15 text-lg transition group-hover:bg-[#d8ff4a] group-hover:text-[#111] md:grid"
              aria-hidden
            >
              →
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
