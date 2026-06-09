import { z } from "zod"

/**
 * Shared AI task and activity types for validation and realtime updates
 */

/**
 * AI status feed message payload
 * Published to Liveblocks feed when AI generation starts, processes, completes, or fails
 */
export type AiStatusFeedMessage = {
  text?: string
}

export const AI_STATUS_FEED_ID = "ai-status-feed"

export function isAiStatusFeedMessage(
  value: unknown
): value is AiStatusFeedMessage {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const payload = value as Record<string, unknown>

  return payload.text === undefined || typeof payload.text === "string"
}

export const AI_CHAT_FEED_ID = "ai-chat"

export const AiChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  createdAt: z.string(),
})

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>

export function isAiChatMessage(value: unknown): value is AiChatMessage {
  return AiChatMessageSchema.safeParse(value).success
}
