import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ReactLenis, useLenis } from "lenis/react"
import { lazy, Suspense, useCallback, useState } from "react"

gsap.registerPlugin(ScrollTrigger)

function LenisGsapBridge() {
  useLenis(() => {
    ScrollTrigger.update()
  })
  return null
}
import { About } from "./components/About"
import { Contact, Footer } from "./components/Contact"
import { Cursor } from "./components/Cursor"
import { Experience } from "./components/Experience"
import { Hero } from "./components/Hero"
import { Loader } from "./components/Loader"
import { Nav } from "./components/Nav"
import { Philosophy } from "./components/Philosophy"
import { Resume } from "./components/Resume"
import { Skills } from "./components/Skills"
import { Work } from "./components/Work"
import { FaceProvider } from "./face/FaceContext"

const Scene = lazy(() =>
  import("./scene/Scene").then((m) => ({ default: m.Scene })),
)

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  return (
    <FaceProvider>
      <ReactLenis root>
        <LenisGsapBridge />
        {!ready && <Loader onDone={done} />}
        <Cursor />
        <div className="grain" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <Nav />
        <main className={`relative z-10 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Hero />
          <Work />
          <Skills />
          <Experience />
          <Philosophy />
          <Resume />
          <About />
          <Contact />
          <Footer />
        </main>
      </ReactLenis>
    </FaceProvider>
  )
}
