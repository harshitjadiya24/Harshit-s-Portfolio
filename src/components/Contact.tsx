import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { profile } from "../data"
import { splitReveal } from "../motion/splitReveal"
import { Terminal } from "./terminal/Terminal"
import { RESUME_URL } from "./terminal/commands"

const plain = [
  { label: "email", href: `mailto:${profile.email}` },
  { label: "resume.pdf", href: RESUME_URL },
  { label: "github ↗", href: profile.github, external: true },
  { label: "linkedin ↗", href: profile.linkedin, external: true },
]

export function Contact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => void splitReveal(".contact-title", { trigger: root.current! }), { scope: root })

  return (
    <section id="contact" ref={root} className="relative pt-[18vh] pb-10">
      <div className="grid grid-cols-12 items-end gap-x-4 px-4 md:gap-x-6 md:px-10">
        <h2 className="contact-title invisible col-span-12 max-w-[14ch] font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em] md:col-span-8">
          Open a <span className="text-signal">channel</span>
        </h2>
        <p className="col-span-12 mt-5 max-w-[32ch] text-[15px] leading-[1.5] text-ink-dim md:col-span-4 md:mt-0 md:text-base">
          A live shell, not a form. Type <code className="font-mono text-ink">contact</code> or{" "}
          <code className="font-mono text-ink">resume</code>.
        </p>
      </div>

      <div className="mt-12">
        <Terminal />
      </div>

      {/* The plain way, for anyone who'd rather not type. */}
      <nav aria-label="Contact links" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 px-4 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-dim md:px-10">
        {plain.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? "noreferrer" : undefined}
            className="transition-colors hover:text-signal"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <footer className="mt-[14vh] flex justify-between border-t border-line px-4 pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim md:px-10">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{profile.location}</span>
      </footer>
    </section>
  )
}
