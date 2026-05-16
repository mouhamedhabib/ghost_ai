import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import {
  enrichCollaborators,
  getProjectForCollaboratorAccess,
  inviteProjectCollaborator,
  isValidCollaboratorEmail,
} from "@/lib/project-collaborators"
import { getCurrentIdentity } from "@/lib/project-access"

type RouteParams = {
  projectId: string
}

function canReadProject(
  project: Awaited<ReturnType<typeof getProjectForCollaboratorAccess>>,
  identity: NonNullable<Awaited<ReturnType<typeof getCurrentIdentity>>>
) {
  if (!project) {
    return false
  }

  return (
    project.ownerId === identity.userId ||
    project.collaborators.some(
      (collaborator) =>
        collaborator.email.toLowerCase() === identity.email.toLowerCase()
    )
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const identity = await getCurrentIdentity()

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectForCollaboratorAccess(projectId)

  if (!project || !canReadProject(project, identity)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const collaborators = await enrichCollaborators(project.collaborators)

  return NextResponse.json({
    collaborators,
    canManage: project.ownerId === identity.userId,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectForCollaboratorAccess(projectId)

  if (!project || project.ownerId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  if (typeof body.email !== "string" || !isValidCollaboratorEmail(body.email)) {
    return NextResponse.json(
      { error: "A valid collaborator email is required" },
      { status: 400 }
    )
  }

  const collaborator = await inviteProjectCollaborator(projectId, body.email)
  const [enrichedCollaborator] = await enrichCollaborators([collaborator])

  return NextResponse.json(enrichedCollaborator, { status: 201 })
}
