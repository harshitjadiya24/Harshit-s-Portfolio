import { useGSAP } from "@gsap/react"
import { ReactLenis, useLenis, type LenisRef } from "lenis/react"
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { About } from "./components/About"
import { Certifications } from "./components/Certifications"
import { Contact } from "./components/Contact"
import { Cursor } from "./components/Cursor"
import { Hero } from "./components/Hero"
import { HireMe } from "./components/HireMe"
import { Loader } from "./components/Loader"
import { Nav } from "./components/Nav"
import { Skills } from "./components/Skills"
import { Work } from "./components/Work"
import { expoOut, gsap, reducedMotion, ScrollTrigger } from "./motion/eases"
import { scrollStory } from "./scene/scrollStory"
import { sceneState } from "./scene/sceneState"

const Stage = lazy(() => import("./scene/Stage").then((m) => ({ default: m.Stage })))

/** Lenis runs on GSAP's ticker so ScrollTrigger and smooth scroll share one clock. */
function useLenisOnGsapTicker(ref: React.RefObject<LenisRef | null>) {
  useEffect(() => {
    const update = (time: number) => ref.current?.lenis?.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [ref])
}

function ScrollSync({ locked }: { locked: boolean }) {
  const lenis = useLenis(ScrollTrigger.update)
  useEffect(() => {
    if (!lenis) return
    if (locked) lenis.stop()
    else lenis.start()
  }, [lenis, locked])
  return null
}

function Shell() {
  const lenisRef = useRef<LenisRef>(null)
  const [ready, setReady] = useState(false)
  useLenisOnGsapTicker(lenisRef)
  useGSAP(scrollStory)

  const reveal = useCallback(() => {
    setReady(true)
    gsap.to(sceneState, { form: 1, duration: reducedMotion() ? 0.01 : 2.6, ease: "expo" })
  }, [])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.09, anchors: { duration: 1.6, easing: expoOut } }}
    >
      <ScrollSync locked={!ready} />
      <Loader onReveal={reveal} />
      <Cursor />
      <Suspense fallback={null}>
        <Stage />
      </Suspense>
      <Nav />
      <main className="relative z-10">
        <Hero ready={ready} />
        <About />
        <Skills />
        <Work />
        <Certifications />
        <Contact />
      </main>
      <HireMe />
    </ReactLenis>
  )
}

export default function App() {
  return <Shell />
}
