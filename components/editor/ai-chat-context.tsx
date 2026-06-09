"use client"

import * as React from "react"

import type { AiChatMessage } from "@/types/tasks"
import { AiChatMessageSchema } from "@/types/tasks"

const AI_SENDER = "Ghost AI"

type AiChatContextValue = {
  messages: AiChatMessage[]
  sendMessage: (content: string) => Promise<void>
  addAssistantMessage: (content: string) => Promise<void>
  isSending: boolean
  error: string | null
  _addMessage: (message: AiChatMessage) => void
}

const AiChatContext = React.createContext<AiChatContextValue | null>(null)

export function useAiChat() {
  const context = React.useContext(AiChatContext)
  if (!context) {
    throw new Error("useAiChat must be used within an AiChatProvider")
  }
  return context
}

export function AiChatProvider({
  children,
  roomId,
  userName,
}: {
  children: React.ReactNode
  roomId: string
  userName: string
}) {
  const [messages, setMessages] = React.useState<AiChatMessage[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const _addMessage = React.useCallback((message: AiChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      const parsed = AiChatMessageSchema.safeParse(message)
      if (!parsed.success) return prev
      return [...prev, parsed.data]
    })
  }, [])

  const sendMessage = React.useCallback(
    async (content: string) => {
      setIsSending(true)
      setError(null)

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, content, sender: userName }),
        })

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(body?.error ?? "Failed to send message")
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send message"
        setError(message)
      } finally {
        setIsSending(false)
      }
    },
    [roomId, userName]
  )

  const addAssistantMessage = React.useCallback(
    async (content: string) => {
      try {
        await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            content,
            sender: AI_SENDER,
            role: "assistant",
          }),
        })
      } catch (err) {
        console.error("Failed to send assistant message:", err)
      }
    },
    [roomId]
  )

  return (
    <AiChatContext.Provider
      value={{ messages, sendMessage, addAssistantMessage, isSending, error, _addMessage }}
    >
      {children}
    </AiChatContext.Provider>
  )
}
