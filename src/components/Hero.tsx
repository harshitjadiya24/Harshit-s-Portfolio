import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { profile } from "../data"
import { useFace } from "../face/FaceContext"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const { setExpression } = useFace()

  useGSAP(
    () => {
      gsap.from(".hero-line", {
        y: 80,
        opacity: 0,
        duration: 1.15,
        stagger: 0.12,
        ease: "power4.out",
        delay: 0.1,
      })
      gsap.from(".hero-meta", {
        opacity: 0,
        y: 20,
        duration: 0.9,
        delay: 0.55,
      })
    },
    { scope: root },
  )

  return (
    <section
      id="top"
      ref={root}
      className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-10 md:pb-20"
      onMouseEnter={() => setExpression("smile")}
    >
      <p className="hero-meta mono mb-8 max-w-md text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
        {profile.school} · {profile.location}
      </p>
      <h1 className="display mb-6 max-w-[11ch] text-[18vw] md:text-[8.6rem]">
        <span className="hero-line block overflow-hidden">Harshit</span>
        <span className="hero-line block overflow-hidden italic text-[#d8ff4a]">
          Jadiya
        </span>
      </h1>
      <div className="hero-line flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <p className="max-w-lg text-lg leading-relaxed text-[#cfcab8] md:text-xl">
          {profile.role}. {profile.tagline}
        </p>
        <div className="flex gap-8 text-sm text-[#9a9588]">
          <div>
            <p className="mono text-[10px] tracking-[0.2em] uppercase">Now</p>
            <p className="mt-1 text-[#f4f1ea]">Building AI-native products</p>
          </div>
          <div>
            <p className="mono text-[10px] tracking-[0.2em] uppercase">Look</p>
            <p className="mt-1 text-[#f4f1ea]">Move the cursor — I follow</p>
          </div>
        </div>
      </div>
    </section>
  )
}
