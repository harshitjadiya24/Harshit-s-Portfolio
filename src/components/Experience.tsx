import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { experience } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

export function Experience() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".timeline-item", {
        scrollTrigger: { trigger: root.current, start: "top 70%" },
        x: -50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
      })
      gsap.from(".timeline-line", {
        scrollTrigger: { trigger: root.current, start: "top 70%" },
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.4,
        ease: "power2.out",
      })
    },
    { scope: root },
  )

  return (
    <section
      id="experience"
      ref={root}
      className="relative z-10 px-5 py-24 md:px-10"
      onMouseEnter={() => setExpression("idle")}
    >
      <div className="mb-14">
        <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
          Journey
        </p>
        <h2 className="display mt-4 max-w-[18ch] text-5xl md:text-7xl">
          Where I've{" "}
          <span className="italic text-[#6ee7ff]">been.</span>
        </h2>
      </div>

      <div className="relative ml-4 md:ml-12">
        {/* Vertical line */}
        <div className="timeline-line absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-[#d8ff4a] via-[#c77dff] to-[#6ee7ff]" />

        <div className="flex flex-col gap-12">
          {experience.map((e, i) => (
            <div key={i} className="timeline-item relative pl-10">
              {/* Dot */}
              <div
                className="absolute left-[-5px] top-2 h-3 w-3 rounded-full border-2"
                style={{
                  borderColor: e.accent,
                  background: `${e.accent}30`,
                  boxShadow: `0 0 12px ${e.accent}40`,
                }}
              />

              <div className="glass rounded-[20px] p-6 transition-all duration-300 hover:border-white/20">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span
                    className="mono text-[11px] tracking-[0.2em] uppercase"
                    style={{ color: e.accent }}
                  >
                    {e.period}
                  </span>
                </div>
                <h3 className="mt-2 text-xl md:text-2xl">{e.title}</h3>
                <p className="mono mt-1 text-[11px] tracking-[0.16em] text-[#9a9588] uppercase">
                  {e.org}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#cfcab8]">
                  {e.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
