import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { skills, story } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

export function About() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".story-item", {
        scrollTrigger: { trigger: root.current, start: "top 70%" },
        x: -40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
      })
    },
    { scope: root },
  )

  const loop = [...skills, ...skills]

  return (
    <section
      id="about"
      ref={root}
      className="relative z-10 py-24"
      onMouseEnter={() => setExpression("think")}
    >
      <div className="px-5 md:px-10">
        <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
          About
        </p>
        <h2 className="display mt-4 max-w-[16ch] text-5xl md:text-7xl">
          ECE hardware.{" "}
          <span className="italic text-[#e7cba0]">AI software.</span> One
          stubborn aesthetic.
        </h2>
      </div>

      <div className="mt-16 overflow-hidden border-y border-white/10 py-5">
        <div className="marquee flex w-max gap-10 pr-10 text-2xl md:text-4xl">
          {loop.map((s, i) => (
            <span key={`${s.name}-${i}`} className="flex items-center gap-10">
              <span className={i % 2 ? "stroke-title" : ""}>{s.name}</span>
              <span className="text-[#d8ff4a]">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-10 px-5 md:grid-cols-3 md:px-10">
        {story.map((s) => (
          <article key={s.k} className="story-item">
            <p className="display text-4xl text-[#d8ff4a]">{s.k}</p>
            <h3 className="mt-4 text-2xl">{s.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#9a9588]">{s.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
