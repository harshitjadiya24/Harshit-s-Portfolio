import { useLenis } from "lenis/react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { profile } from "../data"
import { EXPO, QUINT } from "../motion/eases"
import { HIRE_HASH as HASH } from "./hire"
import { RESUME_URL } from "./terminal/commands"

function useHireOpen() {
  const [open, setOpen] = useState(() => location.hash === HASH)
  useEffect(() => {
    const sync = () => setOpen(location.hash === HASH)
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  return open
}

function close() {
  // Back out of the #hire entry we pushed; on a shared link, just drop the hash.
  if (history.state?.hireOpenedHere) {
    history.back()
  } else {
    history.replaceState(null, "", location.pathname + location.search)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  }
}

type Channel = { label: string; value: string; href: string; external?: boolean; copy?: string }

function channels(): Channel[] {
  const list: Channel[] = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, copy: profile.email },
  ]
  if (profile.phone) {
    list.push({
      label: "Phone",
      value: profile.phone,
      href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`,
      copy: profile.phone,
    })
  }
  list.push(
    { label: "LinkedIn", value: "in/harshit-jadiya24", href: profile.linkedin, external: true },
    { label: "GitHub", value: "harshitjadiya24", href: profile.github, external: true },
    { label: "Resume", value: "resume.pdf", href: RESUME_URL, external: true },
  )
  return list
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 1600)
        } catch {
          /* clipboard blocked: the link still works */
        }
      }}
      className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-signal"
    >
      {done ? "Copied" : "Copy"}
    </button>
  )
}

/** Full-screen contact page over the site: every way to reach me, one tap each. */
export function HireMe() {
  const open = useHireOpen()
  const lenis = useLenis()
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement
      lenis?.stop()
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
      window.addEventListener("keydown", onKey)
      const id = window.setTimeout(() => closeBtn.current?.focus(), 50)
      return () => {
        window.removeEventListener("keydown", onKey)
        window.clearTimeout(id)
      }
    }
    lenis?.start()
    ;(opener.current as HTMLElement | null)?.focus?.()
  }, [open, lenis])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hire-title"
          data-lenis-prevent
          className="fixed inset-0 z-[80] overflow-y-auto bg-bg text-ink"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: QUINT }}
        >
          <div className="flex min-h-full flex-col px-4 py-5 md:px-10 md:py-8">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
              <span>{profile.name}</span>
              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                data-cursor="hover"
                className="text-ink transition-opacity hover:opacity-60"
              >
                Close · Esc
              </button>
            </div>

            <motion.h2
              id="hire-title"
              className="mt-[12vh] max-w-[12ch] font-display text-[clamp(3rem,10vw,10rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em]"
              initial={{ y: 60, opacity: 0, filter: "blur(12px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: EXPO, delay: 0.35 }}
            >
              Let's build <span className="text-signal">together</span>
            </motion.h2>
            <motion.p
              className="mt-6 max-w-[42ch] text-[15px] leading-[1.55] text-ink-dim md:ml-[25vw] md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EXPO, delay: 0.55 }}
            >
              Open to AI / ML engineering internships and full-time roles. I usually reply within a day.
            </motion.p>

            <ul className="mt-[8vh] border-b border-line md:ml-[25vw]">
              {channels().map((c, i) => (
                <motion.li
                  key={c.label}
                  className="border-t border-line"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: EXPO, delay: 0.6 + i * 0.07 }}
                >
                  <div className="group flex items-baseline justify-between gap-6 py-5 md:py-6">
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noreferrer" : undefined}
                      data-cursor="hover"
                      className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-10"
                    >
                      <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
                        {c.label}
                      </span>
                      <span className="truncate font-display text-[clamp(1.4rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.02em] transition-[color,transform] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-2 group-hover:text-signal">
                        {c.value}
                        {c.external && <span className="ml-2 text-ink-dim">↗</span>}
                      </span>
                    </a>
                    {c.copy && <CopyButton text={c.copy} />}
                  </div>
                </motion.li>
              ))}
            </ul>

            <p className="mt-auto pt-[8vh] font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
              {profile.location} · IST
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
