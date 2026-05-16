import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RouteParams = {
  projectId: string
  collaboratorId: string
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project || project.ownerId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: {
      id: collaboratorId,
      projectId,
    },
    select: { id: true },
  })

  if (!collaborator) {
    return NextResponse.json(
      { error: "Collaborator not found" },
      { status: 404 }
    )
  }

  await prisma.projectCollaborator.delete({
    where: { id: collaborator.id },
  })

  return NextResponse.json({ success: true })
}
