import { tasks } from "@trigger.dev/sdk";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { generateSpec, GenerateSpecPayload } from "@/trigger/generate-spec";

type SpecRequestBody = {
  roomId?: unknown;
  chatHistory?: unknown;
  nodes?: unknown;
  edges?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SpecRequestBody;

  try {
    body = (await request.json()) as SpecRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(body.roomId)) {
    return NextResponse.json(
      { error: "Field roomId must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!isArray(body.chatHistory)) {
    return NextResponse.json(
      { error: "Field chatHistory must be an array" },
      { status: 400 }
    );
  }

  if (!isArray(body.nodes)) {
    return NextResponse.json(
      { error: "Field nodes must be an array" },
      { status: 400 }
    );
  }

  if (!isArray(body.edges)) {
    return NextResponse.json(
      { error: "Field edges must be an array" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: body.roomId },
    include: { collaborators: true },
  });

  const hasProjectAccess =
    project?.ownerId === identity.userId ||
    project?.collaborators.some(
      (collaborator) =>
        collaborator.email.toLowerCase() === identity.email.toLowerCase()
    );

  if (!project || !hasProjectAccess) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId: project.id,
      roomId: body.roomId,
      chatHistory: body.chatHistory as GenerateSpecPayload["chatHistory"],
      nodes: body.nodes as GenerateSpecPayload["nodes"],
      edges: body.edges as GenerateSpecPayload["edges"],
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: project.id,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("Error triggering spec generation task:", error);
    return NextResponse.json(
      { error: "Failed to trigger spec generation" },
      { status: 500 }
    );
  }
}
