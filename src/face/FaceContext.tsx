import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Expression = "idle" | "smile" | "think" | "wow" | "wink" | "speak"

type FaceState = {
  expression: Expression
  setExpression: (e: Expression) => void
  speaking: boolean
  setSpeaking: (v: boolean) => void
}

const FaceContext = createContext<FaceState | null>(null)

export function FaceProvider({ children }: { children: ReactNode }) {
  const [expression, setExpression] = useState<Expression>("smile")
  const [speaking, setSpeaking] = useState(false)
  const value = useMemo(
    () => ({ expression, setExpression, speaking, setSpeaking }),
    [expression, speaking],
  )
  return <FaceContext.Provider value={value}>{children}</FaceContext.Provider>
}

export function useFace() {
  const ctx = useContext(FaceContext)
  if (!ctx) throw new Error("useFace must be used inside FaceProvider")
  return ctx
}
