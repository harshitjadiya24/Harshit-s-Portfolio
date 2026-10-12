import { useGSAP } from "@gsap/react"
import { AnimatePresence, motion, useMotionValue } from "motion/react"
import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import { certifications } from "../data"
import { EXPO } from "../motion/eases"
import { splitReveal } from "../motion/splitReveal"

/**
 * Certificates as rows, like Work: title, issuer and year. On hover the
 * certificate image floats beside the cursor; a click opens the image or the
 * issuer's verify link. Renders nothing until certifications has entries.
 */
export function Certifications() {
  const root = useRef<HTMLElement>(null)
  const [peek, setPeek] = useState<string | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useGSAP(
    () => {
      if (certifications.length) splitReveal(".certs-title", { trigger: root.current! })
    },
    { scope: root },
  )

  if (!certifications.length) return null

  return (
    <section
      id="certifications"
      ref={root}
      className="relative py-[14vh]"
    >
      <div className="grid grid-cols-12 items-end gap-x-4 px-4 md:gap-x-6 md:px-10">
        <h2 className="certs-title invisible col-span-12 font-display text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em] md:col-span-8">
          Certified
        </h2>
        <p className="col-span-12 mt-5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-dim md:col-span-3 md:col-start-10 md:mt-0">
          {certifications.length} credential{certifications.length > 1 ? "s" : ""}
        </p>
      </div>

      <ol className="mt-12 border-b border-line">
        {certifications.map((c) => {
          const href = c.url ?? c.image
          const Row = href ? "a" : "div"
          return (
            <li key={c.title} className="border-t border-line">
              <Row
                {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
                data-cursor="hover"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse" && c.image) setPeek(c.image)
                }}
                onPointerMove={(e) => {
                  // Hangs just below the hovered row, sliding with the cursor
                  // sideways, so it never covers the row's own text.
                  const r = e.currentTarget.getBoundingClientRect()
                  const w = Math.min(window.innerWidth * 0.28, 360)
                  x.set(Math.min(Math.max(e.clientX - w / 2, 16), window.innerWidth - w - 16))
                  y.set(r.bottom + 12)
                }}
                onPointerLeave={() => setPeek(null)}
                className="group grid grid-cols-12 items-baseline gap-x-4 px-4 py-6 md:gap-x-6 md:px-10 md:py-8"
              >
                <h3 className="col-span-12 font-display text-[clamp(1.5rem,3.4vw,3rem)] font-semibold leading-[1] tracking-[-0.02em] transition-[color,transform] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-[1vw] group-hover:text-signal md:col-span-8">
                  {c.title}
                </h3>
                <p className="col-span-12 mt-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-dim md:col-span-4 md:mt-0 md:text-right">
                  {c.issuer} · {c.year}
                  {href && <span className="ml-3 text-ink">View ↗</span>}
                </p>
              </Row>
            </li>
          )
        })}
      </ol>

      {/* Floating preview, mouse only. Portaled to <body>: an ancestor with a
          transform/filter would otherwise re-anchor position: fixed to itself. */}
      {createPortal(
      <AnimatePresence>
        {peek && (
          <motion.img
            key={peek}
            src={peek}
            alt=""
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-40 w-[min(28vw,360px)] rounded-[4px] shadow-[0_24px_60px_-20px_oklch(0.1_0.03_260/0.6)]"
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EXPO }}
          />
        )}
      </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}
