import { skills } from "../data"

/**
 * Interim stack list. Phase 2 replaces the body with the draggable physics
 * node graph; the section id and heading stay.
 */
export function Skills() {
  return (
    <section id="skills" className="relative px-4 py-[18vh] md:px-10">
      <h2 className="font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em]">
        Stack
      </h2>
      <ul className="mt-10 flex max-w-[22ch] flex-wrap gap-x-[0.35em] font-display text-[clamp(1.75rem,4.4vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-ink-dim md:ml-[25vw] md:max-w-none">
        {skills.map((s, i) => (
          <li key={s.name} className="transition-colors duration-300 hover:text-signal" data-cursor="hover">
            {s.name}
            {i < skills.length - 1 && <span className="text-ink-ghost"> /</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
