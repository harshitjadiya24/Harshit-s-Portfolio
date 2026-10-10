import { useLenis } from "lenis/react"
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { expoOut, reducedMotion } from "../../motion/eases"
import { MagneticButton } from "../MagneticButton"
import { complete, run, type Ctx, type Line, type Part, type Tone } from "./commands"

const PROMPT = "guest@hj:~$"

const boot: Line[] = [
  { tone: "accent", parts: ["hj-os 2.0 · neural shell"] },
  { tone: "dim", parts: ["(c) Harshit Jadiya. All signals reserved."] },
  { tone: "dim", parts: ["loading weights ............ ", { text: "ok" }] },
  { tone: "dim", parts: ["mounting /work ............. ", { text: "ok" }] },
  { tone: "out", parts: ["type ", { text: "contact" }, " for my email, ", { text: "resume" }, " for the PDF, or ", { text: "help" }, "."] },
]

const tones: Record<Tone, string> = {
  in: "text-ink",
  out: "text-ink",
  dim: "text-ink-dim",
  ok: "text-signal",
  err: "text-[oklch(0.78_0.15_25)]",
  accent: "text-signal term-glow",
}

const quick = ["contact", "resume", "github", "help"]

function PartView({ part }: { part: Part }) {
  if (typeof part === "string") return part
  if (!part.href) return <span className="text-signal">{part.text}</span>
  return (
    <a
      href={part.href}
      download={part.download}
      target={part.external ? "_blank" : undefined}
      rel={part.external ? "noreferrer" : undefined}
      className="text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:decoration-signal"
    >
      {part.text}
    </a>
  )
}

/**
 * The contact section as a working shell. Commands live in commands.ts; this
 * owns input, history, completion and the boot sequence.
 */
export function Terminal() {
  const root = useRef<HTMLDivElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const lenis = useLenis()
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)
  const history = useRef<string[]>([])
  const cursor = useRef(-1)
  const booted = useRef(false)

  // Scrollback is capped so a long session stays light.
  const print = useCallback((...l: Line[]) => setLines((prev) => [...prev, ...l].slice(-300)), [])

  const ctx: Ctx = {
    print,
    clear: () => setLines([]),
    history: () => history.current,
    scrollTo: (t) => lenis?.scrollTo(t, { duration: 1.6, easing: expoOut }),
  }

  const exec = async (cmd: string) => {
    const c = cmd.trim()
    print({ tone: "in", parts: [{ text: PROMPT }, " ", c] })
    if (!c) return
    history.current = [...history.current.filter((h) => h !== c), c]
    cursor.current = -1
    setBusy(true)
    try {
      await run(c, ctx)
    } finally {
      setBusy(false)
    }
  }

  // Boot once, the first time the terminal is on screen.
  useEffect(() => {
    const el = root.current!
    const timers: number[] = []
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || booted.current) return
        booted.current = true
        const step = reducedMotion() ? 0 : 140
        boot.forEach((l, i) => timers.push(window.setTimeout(() => print(l), 200 + i * step)))
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [print])

  useEffect(() => {
    const l = log.current
    if (l) l.scrollTop = l.scrollHeight
  }, [lines])

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current
    if (e.key === "Enter") {
      e.preventDefault()
      if (busy) return
      void exec(value)
      setValue("")
    } else if (e.key === "Tab") {
      e.preventDefault()
      const { value: v, options } = complete(value)
      setValue(v)
      if (options.length > 1) print({ tone: "dim", parts: [options.join("   ")] })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!h.length) return
      cursor.current = cursor.current < 0 ? h.length - 1 : Math.max(0, cursor.current - 1)
      setValue(h[cursor.current])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cursor.current < 0) return
      cursor.current += 1
      if (cursor.current >= h.length) {
        cursor.current = -1
        setValue("")
      } else setValue(h[cursor.current])
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div ref={root} className="term relative">
      <div
        className="relative font-mono text-[13px] leading-[1.75] md:text-[14px]"
        onPointerUp={() => {
          // Click anywhere to type, unless the visitor was selecting text.
          if (!window.getSelection()?.toString()) input.current?.focus({ preventScroll: true })
        }}
      >
        <div
          ref={log}
          data-lenis-prevent
          aria-live="polite"
          aria-label="Terminal output"
          role="log"
          className="term-log h-[min(52svh,460px)] overflow-y-auto overscroll-contain px-4 pt-6 md:px-10"
        >
          {lines.map((l, i) => (
            <p key={i} className={`whitespace-pre-wrap break-words ${tones[l.tone]}`}>
              {l.parts.map((p, j) => (
                <PartView key={j} part={p} />
              ))}
            </p>
          ))}
          <label className="flex items-baseline gap-3 pb-6 text-ink">
            <span className="term-glow shrink-0 text-signal">{PROMPT}</span>
            <span className="sr-only">Command</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="send"
              placeholder={lines.length ? "" : "booting..."}
              className="term-input min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-dim md:text-[14px]"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line px-4 py-5 md:px-10">
        {quick.map((q) => (
          <MagneticButton
            key={q}
            pull={0.25}
            onClick={() => {
              if (!busy) void exec(q)
            }}
            className="rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-[0.06em] text-ink transition-colors duration-300 hover:border-signal hover:text-signal"
          >
            {q}
          </MagneticButton>
        ))}
      </div>
    </div>
  )
}
