import { profile } from "../data"

const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
]

export function Nav() {
  return (
    <header className="pointer-events-auto fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5 py-5 md:px-8">
      <a href="#top" className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d8ff4a] text-xs font-bold text-[#111]">
          HJ
        </span>
        <span className="hidden text-sm tracking-tight md:block">
          {profile.name}
        </span>
      </a>
      <nav className="glass flex items-center gap-1 rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.18em] md:gap-2 md:px-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-full px-2 py-2 transition-colors hover:bg-white/10 md:px-3"
          >
            {l.label}
          </a>
        ))}
      </nav>
      <a
        href="#contact"
        className="hidden items-center gap-2 rounded-full border border-[#d8ff4a]/40 bg-[#d8ff4a]/10 px-3 py-2 text-[11px] tracking-[0.2em] uppercase text-[#d8ff4a] md:flex"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-[pulse-ring_1.6s_ease-out_infinite] rounded-full bg-[#d8ff4a]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d8ff4a]" />
        </span>
        Open to internships
      </a>
    </header>
  )
}
