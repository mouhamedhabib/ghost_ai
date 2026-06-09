import { NextRequest, NextResponse } from "next/server";

import { checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  projectId: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { projectId } = await params;
  const project = await checkProjectAccess(projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ specs });
}
