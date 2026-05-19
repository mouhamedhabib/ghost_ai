import { get, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

import { checkProjectAccess } from '@/lib/project-access';
import { prisma } from '@/lib/prisma';
import type { CanvasState } from '@/types/canvas';

type RouteParams = {
  projectId: string;
};

function isCanvasState(value: unknown): value is CanvasState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const canvas = value as Partial<CanvasState>;

  return Array.isArray(canvas.nodes) && Array.isArray(canvas.edges);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { projectId } = await params;
  const project = await checkProjectAccess(projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json({ canvas: null });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Canvas autosave is not configured' },
      { status: 503 }
    );
  }

  try {
    const blob = await get(project.canvasJsonPath, {
      access: 'private',
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json(
        { error: 'Failed to fetch canvas state' },
        { status: 502 }
      );
    }

    const canvas = (await new Response(blob.stream).json()) as unknown;

    if (!isCanvasState(canvas)) {
      return NextResponse.json(
        { error: 'Saved canvas state is invalid' },
        { status: 502 }
      );
    }

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error('Error loading canvas:', error);
    return NextResponse.json(
      { error: 'Failed to load canvas' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { projectId } = await params;
  const project = await checkProjectAccess(projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  let canvas: unknown;

  try {
    canvas = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  if (!isCanvasState(canvas)) {
    return NextResponse.json(
      { error: 'Canvas state must include nodes and edges arrays' },
      { status: 400 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Canvas autosave is not configured' },
      { status: 503 }
    );
  }

  try {
    const blob = await put(
      `projects/${projectId}/canvas.json`,
      JSON.stringify(canvas),
      {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      }
    );

    await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
    });

    return NextResponse.json({ canvasJsonPath: blob.url });
  } catch (error) {
    console.error('Error saving canvas:', error);
    return NextResponse.json(
      { error: 'Failed to save canvas' },
      { status: 500 }
    );
  }
}
