import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { skills } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

const groups = ["Core", "AI", "Product", "Systems", "Craft"] as const

const groupColors: Record<string, string> = {
  Core: "#d8ff4a",
  AI: "#c77dff",
  Product: "#6ee7ff",
  Systems: "#ff6b8a",
  Craft: "#e7cba0",
}

export function Skills() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".skill-group", {
        scrollTrigger: { trigger: root.current, start: "top 75%" },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.85,
        ease: "power3.out",
      })
    },
    { scope: root },
  )

  return (
    <section
      id="skills"
      ref={root}
      className="relative z-10 px-5 py-24 md:px-10"
      onMouseEnter={() => setExpression("think")}
    >
      <div className="mb-14">
        <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
          Toolkit
        </p>
        <h2 className="display mt-4 max-w-[18ch] text-5xl md:text-7xl">
          Tools I{" "}
          <span className="italic text-[#c77dff]">think&nbsp;</span>with.
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => {
          const items = skills.filter((s) => s.group === g)
          if (!items.length) return null
          const color = groupColors[g]
          return (
            <div key={g} className="skill-group glass rounded-[24px] p-6">
              <p
                className="mono text-[10px] tracking-[0.24em] uppercase"
                style={{ color }}
              >
                {g}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {items.map((s) => (
                  <span
                    key={s.name}
                    className="skill-pill rounded-full border px-4 py-2 text-sm transition-colors duration-300"
                    style={{
                      borderColor: `${color}30`,
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = `${color}18`
                      ;(e.currentTarget as HTMLElement).style.borderColor = `${color}80`
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = "transparent"
                      ;(e.currentTarget as HTMLElement).style.borderColor = `${color}30`
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
