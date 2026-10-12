import { useSyncExternalStore } from "react"

export type Theme = "dark" | "light"

const KEY = "theme"
/** Browser-chrome colour per theme; mirrors --color-bg. */
const CHROME: Record<Theme, string> = { dark: "#040817", light: "#f3f6fa" }

const listeners = new Set<() => void>()
const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: light)") : null

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === "light" || v === "dark" ? v : null
  } catch {
    return null
  }
}

const system = (): Theme => (mq?.matches ? "light" : "dark")

let current: Theme = stored() ?? system()

function apply(t: Theme) {
  const root = document.documentElement
  root.dataset.theme = t
  root.style.colorScheme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[t])
}

function set(t: Theme) {
  if (t === current) return
  current = t
  apply(t)
  listeners.forEach((l) => l())
}

if (typeof document !== "undefined") {
  apply(current)
  // Follow the OS until the visitor makes a choice of their own.
  mq?.addEventListener("change", () => {
    if (!stored()) set(system())
  })
}

export const getTheme = () => current

/** The visitor's explicit choice: applied now and remembered. */
export function setTheme(t: Theme) {
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* private mode: the choice just won't persist */
  }
  set(t)
}

export function useTheme() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    getTheme,
  )
}
