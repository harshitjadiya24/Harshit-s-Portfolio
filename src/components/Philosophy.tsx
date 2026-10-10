import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { philosophy, story } from "../data"
import { gsap, reducedMotion } from "../motion/eases"

/** `*word*` in the statement marks a keyword that fills to signal instead of ink. */
function words(text: string) {
  return text.split(" ").map((w, i) => {
    const kw = w.startsWith("*")
    const clean = w.replace(/\*/g, "")
    return (
      <span key={i} className="fill-word" data-kw={kw || undefined}>
        {clean}{" "}
      </span>
    )
  })
}

export function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.to(".fill-word", {
        "--fill": 1,
        ease: "none",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".phil-statement",
          start: "top 78%",
          end: "bottom 45%",
          scrub: 0.6,
        },
      })
      gsap.utils.toArray<HTMLElement>(".phil-note").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          filter: "blur(10px)",
          duration: 1.3,
          ease: "expo",
          scrollTrigger: { trigger: el, start: "top 88%" },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      id="about"
      ref={root}
      className="relative grid grid-cols-12 gap-x-4 px-4 pt-[22vh] pb-[18vh] md:gap-x-6 md:px-10 md:pt-[30vh]"
    >
      <h2 className="sr-only">Philosophy</h2>
      <p className="phil-statement col-span-12 font-display text-[clamp(2.1rem,5.6vw,6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance md:col-span-11 md:col-start-2">
        {words(philosophy)}
      </p>

      <div className="col-span-12 mt-[14vh] grid grid-cols-12 gap-x-4 gap-y-14 md:gap-x-6">
        {/* The third story beat is the statement above, so only the first two appear. */}
        {story.slice(0, 2).map((s, i) => (
          <article
            key={s.t}
            className={[
              "phil-note col-span-12 max-w-[38ch] sm:col-span-6",
              i === 0 && "md:col-span-4 md:col-start-2",
              i === 1 && "md:col-span-4 md:col-start-8 md:mt-[18vh]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink md:text-[1.75rem]">
              {s.t}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.55] text-ink-dim md:text-base">{s.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
