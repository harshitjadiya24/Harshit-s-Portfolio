import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { story } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

const cardAccents = ["#d8ff4a", "#c77dff", "#6ee7ff"]

export function Philosophy() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".phil-card", {
        scrollTrigger: { trigger: root.current, start: "top 70%" },
        y: 80,
        opacity: 0,
        stagger: 0.14,
        duration: 1,
        ease: "power3.out",
      })
      gsap.from(".phil-head", {
        scrollTrigger: { trigger: root.current, start: "top 75%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
      })
    },
    { scope: root },
  )

  return (
    <section
      id="philosophy"
      ref={root}
      className="relative z-10 overflow-hidden py-28"
      onMouseEnter={() => setExpression("think")}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 50% 40%, rgba(199,125,255,0.07), transparent 60%)",
        }}
      />

      <div className="relative px-5 md:px-10">
        <div className="phil-head mb-16 text-center">
          <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
            Philosophy
          </p>
          <h2 className="display mx-auto mt-4 max-w-[20ch] text-5xl md:text-7xl">
            How I{" "}
            <span className="italic text-[#e7cba0]">think</span> about
            building.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {story.map((s, i) => {
            const accent = cardAccents[i % cardAccents.length]
            return (
              <article
                key={s.k}
                className="phil-card group relative overflow-hidden rounded-[28px] border border-white/8 p-8 transition-all duration-500 hover:border-white/15"
                style={{
                  background: `linear-gradient(160deg, ${accent}06 0%, transparent 50%)`,
                }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  const rx = ((e.clientY - r.top) / r.height - 0.5) * -4
                  const ry = ((e.clientX - r.left) / r.width - 0.5) * 6
                  e.currentTarget.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(800px) rotateX(0) rotateY(0)"
                }}
              >
                {/* Number accent */}
                <span
                  className="display absolute -right-3 -top-6 text-[8rem] leading-none select-none"
                  style={{ color: `${accent}08` }}
                >
                  {s.k}
                </span>

                <div className="relative">
                  <span
                    className="display text-5xl"
                    style={{ color: accent }}
                  >
                    {s.k}
                  </span>
                  <h3 className="mt-5 text-2xl md:text-3xl">{s.t}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#cfcab8]">
                    {s.d}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className="mt-6 h-[2px] w-12 rounded-full transition-all duration-500 group-hover:w-20"
                    style={{ background: accent }}
                  />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
