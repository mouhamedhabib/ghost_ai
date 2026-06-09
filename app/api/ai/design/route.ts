import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { designAgentTask } from "@/trigger/design-agent";

type DesignRequestBody = {
  prompt?: unknown;
  roomId?: unknown;
  projectId?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DesignRequestBody;

  try {
    body = (await request.json()) as DesignRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(body.prompt)) {
    return NextResponse.json(
      { error: "Field prompt must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(body.roomId)) {
    return NextResponse.json(
      { error: "Field roomId must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(body.projectId)) {
    return NextResponse.json(
      { error: "Field projectId must be a non-empty string" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
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
    const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
      prompt: body.prompt,
      roomId: body.roomId,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: project.id,
        userId: identity.userId,
      },
    });

    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (error) {
    console.error("Error triggering design agent task:", error);
    return NextResponse.json(
      { error: "Failed to trigger design agent task" },
      { status: 500 }
    );
  }
}
