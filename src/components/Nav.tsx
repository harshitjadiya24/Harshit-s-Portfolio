import { certifications, profile } from "../data"
import { openHire } from "./hire"

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Stack" },
  { href: "#work", label: "Work" },
  ...(certifications.length ? [{ href: "#certifications", label: "Certs" }] : []),
  { href: "#contact", label: "Contact" },
]

/** Difference-blended near-white, so it inverts over whatever scrolls beneath. */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-start justify-between px-4 py-4 text-paper mix-blend-difference md:px-10 md:py-6">
      <a href="#hero" className="font-display text-lg font-semibold leading-none tracking-[-0.02em]">
        {profile.name}
      </a>
      <nav aria-label="Sections" className="flex items-center gap-4 md:gap-7">
        <ul className="flex gap-4 font-mono text-[11px] uppercase tracking-[0.12em] md:gap-7">
          {links.map((l, i) => (
            <li key={l.href} className={i < 2 ? "hidden sm:block" : undefined}>
              <a href={l.href} className="transition-opacity hover:opacity-60">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={openHire}
          data-cursor="hover"
          className="rounded-full border border-paper px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-[background-color,color] duration-300 hover:bg-paper hover:text-[oklch(0.14_0.035_265)]"
        >
          Hire me
        </button>
      </nav>
    </header>
  )
}
