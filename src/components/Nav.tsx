import { certifications, profile } from "../data"
import { setTheme, useTheme } from "../theme"
import { openHire } from "./hire"

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Stack" },
  { href: "#work", label: "Work" },
  ...(certifications.length ? [{ href: "#certifications", label: "Certs" }] : []),
  { href: "#contact", label: "Contact" },
]

const swap = "transition-[opacity,transform] duration-500 ease-[var(--ease-expo)]"

/** Sun and moon share one 24px box and crossfade with a quarter turn. */
function ThemeToggle() {
  const theme = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      data-cursor="hover"
      className="relative -m-1.5 grid size-7 place-items-center"
    >
      <svg
        viewBox="0 0 24 24"
        className={`absolute size-4 ${swap} ${theme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className={`absolute size-4 ${swap} ${theme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 14.6A8.5 8.5 0 1 1 9.4 4a6.8 6.8 0 0 0 10.6 10.6Z" />
      </svg>
    </button>
  )
}

/** Difference-blended, so it stays a fixed near-white and inverts over either theme. */
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
        <ThemeToggle />
      </nav>
    </header>
  )
}
