import { useEffect, useRef } from "react"

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`
      }
      if (ring.current) {
        ring.current.animate(
          { transform: `translate(${x - 18}px, ${y - 18}px)` },
          { duration: 280, fill: "forwards" },
        )
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <>
      <div
        ref={dot}
        className="cursor-dot h-[6px] w-[6px] bg-[#d8ff4a]"
      />
      <div
        ref={ring}
        className="cursor-ring h-9 w-9 border border-[#f4f1ea]"
      />
    </>
  )
}
