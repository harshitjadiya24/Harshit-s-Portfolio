import { profile } from "../data"

const links = [
  { href: "#about", label: "Philosophy" },
  { href: "#skills", label: "Stack" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
]

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-start justify-between px-4 py-4 mix-blend-difference md:px-10 md:py-6">
      <a href="#hero" className="font-display text-lg font-semibold leading-none tracking-[-0.02em] text-ink">
        {profile.name}
      </a>
      <nav aria-label="Sections">
        <ul className="flex gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink md:gap-7">
          {links.map((l, i) => (
            <li key={l.href} className={i < 2 ? "hidden sm:block" : undefined}>
              <a href={l.href} className="transition-opacity hover:opacity-60">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
