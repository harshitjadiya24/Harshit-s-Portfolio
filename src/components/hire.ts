export const HIRE_HASH = "#hire"

/** Open the Hire Me page. It lives at #hire so the link can be shared. */
export function openHire() {
  if (location.hash === HIRE_HASH) return
  // Marked so Close can step back instead of leaving a shared #hire link.
  history.pushState({ hireOpenedHere: true }, "", HIRE_HASH)
  window.dispatchEvent(new HashChangeEvent("hashchange"))
}
