import { useGSAP } from "@gsap/react"
import { useLenis } from "lenis/react"
import { useEffect, useRef, useState } from "react"
import { profile } from "../data"
import { expoOut, gsap, reducedMotion } from "../motion/eases"
import { splitReveal } from "../motion/splitReveal"
import { MagneticButton } from "./MagneticButton"

function useNagpurTime() {
  const [now, setNow] = useState("")
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const time = useNagpurTime()

  useGSAP(
    () => {
      if (!ready) return
      splitReveal(".hero-l1", { delay: 0.15 })
      splitReveal(".hero-l2", { delay: 0.45, from: "end" })
      if (!reducedMotion()) {
        gsap.from(".hero-meta", {
          opacity: 0,
          y: 16,
          filter: "blur(8px)",
          duration: 1.2,
          ease: "expo",
          stagger: 0.08,
          delay: 1.1,
        })
      }

      // Type drifts apart as the hero leaves: line one left, line two right.
      gsap.to(".hero-l1", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
      gsap.to(".hero-l2", {
        xPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section
      id="hero"
      ref={root}
      className="relative flex h-[100svh] min-h-[560px] flex-col justify-end overflow-hidden px-4 pb-6 md:px-10 md:pb-8"
    >
      {/* Type owns the left half; the particle figure stands in the right. */}
      <h1
        className="pointer-events-none relative -mb-[0.06em] font-display text-[clamp(3.25rem,8.6vw,10rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em]"
        aria-label="AI Engineer / Architect"
      >
        <span className="hero-l1 invisible block whitespace-nowrap" aria-hidden>
          AI <br />
          Engineer <span className="text-signal">/</span>
        </span>
        <span className="hero-l2 invisible block whitespace-nowrap" aria-hidden>
          Architect
        </span>
      </h1>

      <div className="relative mt-8 grid grid-cols-2 items-end gap-x-6 gap-y-6 md:mt-10 md:grid-cols-12">
        <p className="hero-meta col-span-2 max-w-[34ch] text-[15px] leading-[1.45] text-ink md:col-span-4 md:text-base">
          {profile.tagline}
        </p>
        <dl className="hero-meta col-span-1 font-mono text-[11px] uppercase leading-[1.7] tracking-[0.12em] text-ink-dim md:col-span-3 md:col-start-6">
          <dt className="sr-only">Based in</dt>
          <dd>{profile.school}</dd>
          <dt className="sr-only">Local time</dt>
          <dd className="tabular text-ink">
            Nagpur {time} IST
          </dd>
        </dl>
        <div className="hero-meta col-span-1 flex justify-end md:col-span-4 md:col-start-9">
          <MagneticButton
            onClick={() => lenis?.scrollTo("#about", { duration: 1.6, easing: expoOut })}
            className="group grid size-28 place-items-center rounded-full bg-signal-fill font-display text-sm font-semibold uppercase tracking-[0.02em] text-on-signal transition-[box-shadow] duration-500 ease-[var(--ease-expo)] hover:shadow-[0_18px_50px_-12px_oklch(0.88_0.19_125/0.55)] md:size-36 md:text-base"
          >
            Initialize
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0.5">
              <path d="M7 1v12M1.5 7.5 7 13l5.5-5.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
