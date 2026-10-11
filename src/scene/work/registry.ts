import { useSyncExternalStore } from "react"

export type Project = {
  slug: string
  index: string
  title: string
  tags: readonly string[]
  accent: string
  poster?: string
  video?: string
}

/**
 * A DOM band the WebGL layer paints a project into. Work rows own the
 * element and write the animated values; the Stage reads them every frame.
 */
export type MediaSlot = {
  project: Project
  el: HTMLElement
  /** 0 → 1 scrubbed as the band scrolls in. */
  reveal: { v: number }
  /** 0 → 1 poster → preview, tweened on hover. */
  hover: { v: number }
  /** Pointer in band UV space (0–1, y up). */
  mouse: { x: number; y: number }
}

let slots: MediaSlot[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function registerSlot(slot: MediaSlot) {
  slots = [...slots, slot]
  emit()
  return () => {
    slots = slots.filter((s) => s !== slot)
    emit()
  }
}

/** Non-React read, for per-frame code. */
export const currentSlots = () => slots

export function useSlots() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => slots,
  )
}
