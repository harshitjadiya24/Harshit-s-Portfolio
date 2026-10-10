import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { skills } from "../data"
import { splitReveal } from "../motion/splitReveal"
import { SkillGraph } from "./skills/SkillGraph"

export function Skills() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => void splitReveal(".skills-title", { trigger: root.current! }), { scope: root })

  return (
    <section id="skills" ref={root} className="relative px-4 pt-[18vh] pb-[8vh] md:px-10">
      <div className="grid grid-cols-12 items-end gap-x-4 md:gap-x-6">
        <h2 className="skills-title invisible col-span-12 font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em] md:col-span-7">
          Stack
        </h2>
        <p className="col-span-12 mt-5 max-w-[34ch] text-[15px] leading-[1.5] text-ink-dim md:col-span-4 md:col-start-9 md:mt-0 md:text-base">
          The tools, wired the way I actually use them. Grab a node and throw it.
        </p>
      </div>

      <ul className="sr-only">
        {skills.map((s) => (
          <li key={s.name}>
            {s.name} ({s.group})
          </li>
        ))}
      </ul>

      <div className="-mx-4 mt-6 md:-mx-10">
        <SkillGraph />
      </div>
    </section>
  )
}
