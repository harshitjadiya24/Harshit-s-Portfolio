import { profile } from "../data"

/**
 * Interim contact block. Phase 4 swaps the body for the CLI terminal
 * (`contact`, `resume`, …); the links below remain as its no-JS fallback.
 */
export function Contact() {
  return (
    <section id="contact" className="relative px-4 pt-[18vh] pb-10 md:px-10">
      <h2 className="max-w-[14ch] font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em]">
        Open a <span className="text-signal">channel</span>
      </h2>
      <div className="mt-12 flex flex-col gap-3 font-mono text-sm md:ml-[25vw] md:text-base">
        <a href={`mailto:${profile.email}`} className="w-fit underline decoration-line underline-offset-[6px] transition-colors hover:text-signal hover:decoration-signal">
          {profile.email}
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-fit text-ink-dim transition-colors hover:text-signal">
          linkedin ↗
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="w-fit text-ink-dim transition-colors hover:text-signal">
          github ↗
        </a>
      </div>
      <footer className="mt-[16vh] flex justify-between border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{profile.location}</span>
      </footer>
    </section>
  )
}
