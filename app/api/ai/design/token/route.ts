import { auth as triggerAuth } from "@trigger.dev/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type TokenRequestBody = {
  runId?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TokenRequestBody;

  try {
    body = (await request.json()) as TokenRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(body.runId)) {
    return NextResponse.json(
      { error: "Field runId must be a non-empty string" },
      { status: 400 }
    );
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId: body.runId },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  try {
    const token = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [taskRun.runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating design agent public token:", error);
    return NextResponse.json(
      { error: "Failed to create design agent token" },
      { status: 500 }
    );
  }
}
