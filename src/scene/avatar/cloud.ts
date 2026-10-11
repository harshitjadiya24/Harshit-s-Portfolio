import { quality } from "../sceneState"
import { proceduralHead } from "./proceduralHead"
import { sampleFace } from "./sampleFace"

export type FaceCloud = {
  /** xyz per point, head roughly spans y ∈ [-1.5, 1.3], centred on x = 0. */
  positions: Float32Array
  /** 0–1 tone per point; drives size and colour. */
  brightness: Float32Array
  count: number
  source: "photo" | "procedural"
}

/** Cut-out portrait (alpha = subject). A plain JPG on a flat backdrop also works. */
export const FACE_SRC = "/face.webp"

let pending: Promise<FaceCloud> | null = null

/** Shared by the Loader (progress) and the Stage (render), so sampling runs once. */
export function loadFaceCloud() {
  pending ??= sampleFace(FACE_SRC, quality.points).catch(() =>
    proceduralHead(quality.points),
  )
  return pending
}
