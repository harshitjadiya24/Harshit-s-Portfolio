import { useRef, useState } from "react"
import type { Expression } from "../face/FaceContext"
import { useFace } from "../face/FaceContext"

const looks: { id: Expression; label: string; hint: string }[] = [
  { id: "smile", label: "Smile", hint: "Default charm" },
  { id: "idle", label: "Idle", hint: "Listening" },
  { id: "think", label: "Think", hint: "Debugging life" },
  { id: "wow", label: "Wow", hint: "When the loss drops" },
  { id: "wink", label: "Wink", hint: "Shipped it" },
  { id: "speak", label: "Talk", hint: "Demo mode" },
]

export function FaceStudio() {
  const { expression, setExpression, speaking, setSpeaking } = useFace()
  const [line, setLine] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cam, setCam] = useState<"off" | "on" | "blocked">("off")

  const enableCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCam("on")
      setExpression("smile")
    } catch {
      setCam("blocked")
    }
  }

  const talk = (text: string) => {
    setLine(text)
    setSpeaking(text.length > 0)
    if (text.length > 0) setExpression("speak")
  }

  return (
    <section
      id="face"
      className="relative z-10 px-5 py-24 md:px-10"
      onMouseEnter={() => {
        if (!speaking) setExpression(expression)
      }}
    >
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="display text-6xl md:text-8xl">
          Face <span className="italic text-[#c77dff]">studio</span>
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#9a9588]">
          The portrait on the right is a live rig — blinks, looks at you, and
          morphs by expression. Drive it from here, or mirror your own camera.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[28px] p-6 md:p-8">
          <p className="mono mb-4 text-[11px] tracking-[0.22em] text-[#9a9588] uppercase">
            Expression mixer
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {looks.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setSpeaking(l.id === "speak")
                  setExpression(l.id)
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  expression === l.id
                    ? "border-[#d8ff4a] bg-[#d8ff4a]/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <span className="block text-lg">{l.label}</span>
                <span className="mt-1 block text-xs text-[#9a9588]">{l.hint}</span>
              </button>
            ))}
          </div>
          <label className="mt-8 block">
            <span className="mono text-[11px] tracking-[0.22em] text-[#9a9588] uppercase">
              Make him talk
            </span>
            <input
              value={line}
              onChange={(e) => talk(e.target.value)}
              placeholder="Type anything — the mouth follows…"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none ring-[#d8ff4a] placeholder:text-[#6f6b62] focus:ring-2"
            />
          </label>
        </div>

        <div className="glass overflow-hidden rounded-[28px] p-6 md:p-8">
          <p className="mono mb-4 text-[11px] tracking-[0.22em] text-[#9a9588] uppercase">
            Owner camera
          </p>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-black/40">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full scale-x-[-1] object-cover ${cam === "on" ? "opacity-100" : "opacity-0"}`}
            />
            {cam !== "on" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-sm text-[#cfcab8]">
                  Drop your face into the site. Local camera only — nothing is
                  uploaded.
                </p>
                <button
                  type="button"
                  onClick={enableCam}
                  className="rounded-full bg-[#d8ff4a] px-5 py-3 text-sm font-medium text-[#111]"
                >
                  {cam === "blocked" ? "Permission blocked" : "Enable camera"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
