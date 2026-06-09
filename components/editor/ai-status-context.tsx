"use client"

import * as React from "react"

export type AiStatusMessage = Extract<Liveblocks["RoomEvent"], { type: "ai-status" }>

type AiStatusState = {
  message: AiStatusMessage | null
}

type AiStatusContextValue = {
  status: AiStatusState
  updateStatus: (message: AiStatusMessage | null) => void
}

const AiStatusContext = React.createContext<AiStatusContextValue | null>(null)

export function useAiStatus() {
  const context = React.useContext(AiStatusContext)
  if (!context) {
    throw new Error("useAiStatus must be used within an AiStatusProvider")
  }
  return context
}

export function AiStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AiStatusState>({ message: null })

  const updateStatus = React.useCallback((message: AiStatusMessage | null) => {
    setStatus({ message })
  }, [])

  return (
    <AiStatusContext value={{ status, updateStatus }}>
      {children}
    </AiStatusContext>
  )
}
