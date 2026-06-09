import { NextRequest, NextResponse } from "next/server"

import { getLiveblocksClient } from "@/lib/liveblocks"
import { getCurrentIdentity } from "@/lib/project-access"
import { AiChatMessageSchema } from "@/types/tasks"

type ChatRequestBody = {
  roomId?: unknown
  content?: unknown
  sender?: unknown
  role?: unknown
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity()

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ChatRequestBody

  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  if (!isNonEmptyString(body.roomId)) {
    return NextResponse.json(
      { error: "Field roomId must be a non-empty string" },
      { status: 400 }
    )
  }

  if (!isNonEmptyString(body.content)) {
    return NextResponse.json(
      { error: "Field content must be a non-empty string" },
      { status: 400 }
    )
  }

  if (!isNonEmptyString(body.sender)) {
    return NextResponse.json(
      { error: "Field sender must be a non-empty string" },
      { status: 400 }
    )
  }

  const role = body.role === "assistant" ? "assistant" : "user"

  const chatMessage = {
    id: crypto.randomUUID(),
    sender: body.sender,
    role,
    content: body.content,
    createdAt: new Date().toISOString(),
  }

  const validation = AiChatMessageSchema.safeParse(chatMessage)
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid chat message" },
      { status: 500 }
    )
  }

  try {
    await getLiveblocksClient().broadcastEvent(body.roomId, {
      type: "ai-chat",
      ...validation.data,
    })

    return NextResponse.json({ id: chatMessage.id })
  } catch (error) {
    console.error("Error broadcasting chat message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
