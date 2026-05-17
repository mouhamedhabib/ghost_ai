import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import {
  getLiveblocksClient,
  getCursorColorForUser,
  hasLiveblocksSecret,
} from "@/lib/liveblocks"
import { checkProjectAccess, getCurrentIdentity } from "@/lib/project-access"

type LiveblocksAuthBody = {
  projectId?: unknown
  room?: unknown
  roomId?: unknown
}

function getProjectId(body: LiveblocksAuthBody) {
  const projectId = body.projectId ?? body.room ?? body.roomId

  return typeof projectId === "string" && projectId.length > 0
    ? projectId
    : null
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return "Anonymous"
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()

  return (
    user.fullName ||
    name ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "Anonymous"
  )
}

export async function POST(request: NextRequest) {
  if (!hasLiveblocksSecret()) {
    return NextResponse.json(
      { error: "Liveblocks is not configured" },
      { status: 503 }
    )
  }

  const identity = await getCurrentIdentity()

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: LiveblocksAuthBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  const projectId = getProjectId(body)

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing Liveblocks room ID" },
      { status: 400 }
    )
  }

  const project = await checkProjectAccess(projectId)

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const liveblocks = getLiveblocksClient()
    const user = await currentUser()
    const color = getCursorColorForUser(identity.userId)

    await liveblocks.getOrCreateRoom(project.id, {
      defaultAccesses: [],
      metadata: {
        projectId: project.id,
        projectName: project.name,
      },
    })

    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name: getDisplayName(user),
        avatar: user?.imageUrl || "",
        color,
      },
    })

    session.allow(project.id, session.FULL_ACCESS)

    const { body: tokenBody, status } = await session.authorize()

    return new Response(tokenBody, { status })
  } catch (error) {
    console.error("Error authorizing Liveblocks session:", error)

    return NextResponse.json(
      { error: "Failed to authorize Liveblocks session" },
      { status: 500 }
    )
  }
}
