import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  projectId: string;
  specId: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { projectId, specId } = await params;
  const project = await checkProjectAccess(projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  });

  if (!spec || spec.projectId !== projectId) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Spec storage is not configured" },
      { status: 503 }
    );
  }

  try {
    const blob = await get(spec.filePath, {
      access: "private",
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch spec file" },
        { status: 502 }
      );
    }

    const text = await new Response(blob.stream).text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
      },
    });
  } catch (error) {
    console.error("Error downloading spec:", error);
    return NextResponse.json(
      { error: "Failed to download spec" },
      { status: 500 }
    );
  }
}
