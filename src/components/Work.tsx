import { projects } from "../data"

/**
 * Full-bleed project rows. Phase 3 adds the WebGL displacement reveal
 * (thumbnail → video) that follows the cursor across each row.
 */
export function Work() {
  return (
    <section id="work" className="relative py-[14vh]">
      <h2 className="px-4 font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em] md:px-10">
        Work
      </h2>
      <ol className="mt-12 border-t border-line">
        {projects.map((p, i) => (
          <li key={p.title} className="group border-b border-line" data-cursor="hover">
            <div
              className={`grid grid-cols-12 items-baseline gap-x-4 px-4 py-7 transition-colors duration-500 ease-[var(--ease-expo)] group-hover:bg-bg-2 md:gap-x-6 md:px-10 md:py-10 ${
                i % 2 ? "md:[&>h3]:col-start-4" : ""
              }`}
            >
              <h3 className="col-span-12 font-display text-[clamp(2.25rem,7.5vw,8.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-[1.5vw] group-hover:text-signal md:col-span-8">
                {p.title}
              </h3>
              <div className="col-span-12 mt-4 md:col-span-3 md:col-start-10 md:row-start-1 md:mt-0 md:self-end">
                <p className="text-[15px] leading-[1.5] text-ink-dim">{p.description}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
                  {p.year} — {p.tags.join(" · ")}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
