import { useEffect, useState } from "react"

export function Loader({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0)

  useEffect(() => {
    let n = 0
    const id = window.setInterval(() => {
      n += Math.random() * 14 + 6
      if (n >= 100) {
        n = 100
        window.clearInterval(id)
        window.setTimeout(onDone, 420)
      }
      setP(Math.min(100, Math.floor(n)))
    }, 90)
    return () => window.clearInterval(id)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-between bg-[#07070c] px-6 py-8 text-[#f4f1ea] md:px-10">
      <div className="flex items-center justify-between text-[11px] tracking-[0.28em] uppercase mono text-[#9a9588]">
        <span>Harshit Jadiya</span>
        <span>Initializing face rig</span>
      </div>
      <div>
        <p className="display text-[18vw] leading-none md:text-[9rem]">
          {String(p).padStart(3, "0")}
        </p>
        <div className="mt-4 h-[2px] w-full bg-white/10">
          <div
            className="h-full bg-[#d8ff4a] transition-[width] duration-150"
            style={{ width: `${p}%` }}
          />
        </div>
      </div>
      <p className="max-w-sm text-sm text-[#9a9588]">
        Loading a 3D portrait, scroll choreography, and a slightly too-confident
        color palette.
      </p>
    </div>
  )
}
