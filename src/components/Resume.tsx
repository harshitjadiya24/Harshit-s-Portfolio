import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef, useState } from "react"
import { profile, stats } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

function Counter({ target, active }: { target: number; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1400
    const startTime = performance.now()
    let raf: number

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      start = Math.floor(eased * target)
      setCount(start)
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, target])

  return <>{count}</>
}

export function Resume() {
  const root = useRef<HTMLElement>(null)
  const [countersActive, setCountersActive] = useState(false)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".resume-head", {
        scrollTrigger: { trigger: root.current, start: "top 75%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
      })
      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: root.current,
          start: "top 70%",
          onEnter: () => setCountersActive(true),
        },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
      })
      gsap.from(".resume-cta", {
        scrollTrigger: { trigger: root.current, start: "top 60%" },
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
      })
    },
    { scope: root },
  )

  return (
    <section
      id="resume"
      ref={root}
      className="relative z-10 overflow-hidden py-28"
      onMouseEnter={() => setExpression("smile")}
    >
      {/* Gradient background band */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(216,255,74,0.03) 30%, rgba(216,255,74,0.03) 70%, transparent)",
        }}
      />

      <div className="relative px-5 md:px-10">
        <div className="resume-head mb-14 text-center">
          <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
            At a Glance
          </p>
          <h2 className="display mx-auto mt-4 max-w-[18ch] text-5xl md:text-7xl">
            Numbers that{" "}
            <span className="italic text-[#d8ff4a]">ship.</span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="stat-card glass flex flex-col items-center rounded-[20px] px-4 py-8 text-center"
            >
              <span className="display text-5xl text-[#d8ff4a] md:text-6xl">
                <Counter target={s.value} active={countersActive} />
                <span className="text-3xl">+</span>
              </span>
              <span className="mono mt-3 text-[10px] tracking-[0.2em] text-[#9a9588] uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="resume-cta mt-14 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="group flex items-center gap-3 rounded-full bg-[#d8ff4a] px-8 py-4 text-sm font-medium text-[#111] transition-all duration-300 hover:shadow-[0_0_32px_rgba(216,255,74,0.3)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Resume
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm transition-all duration-300 hover:border-white/40 hover:bg-white/5"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
