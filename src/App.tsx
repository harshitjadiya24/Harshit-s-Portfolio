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
import { FaceStudio } from "./components/FaceStudio"
import { Hero } from "./components/Hero"
import { Loader } from "./components/Loader"
import { Nav } from "./components/Nav"
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
          <FaceStudio />
          <About />
          <Contact />
          <Footer />
        </main>
      </ReactLenis>
    </FaceProvider>
  )
}
