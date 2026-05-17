import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  projectId: string;
}

// PATCH /api/projects/[projectId] - rename project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projectId } = await params;

    // Parse and validate request body first
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate body fields if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          { error: 'Field name must be a string' },
          { status: 400 }
        );
      }
      if (body.name.length > 255) {
        return NextResponse.json(
          { error: 'Field name must not exceed 255 characters' },
          { status: 400 }
        );
      }
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          { error: 'Field description must be a string' },
          { status: 400 }
        );
      }
      if (body.description.length > 1000) {
        return NextResponse.json(
          { error: 'Field description must not exceed 1000 characters' },
          { status: 400 }
        );
      }
    }

    // Check if project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // Return 404 if project doesn't exist or doesn't belong to user (don't leak existence)
    if (!project || project.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project with validated values
    const name = body.name ?? project.name;
    const description = body.description !== undefined ? body.description : project.description;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projectId } = await params;

    // Check if project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // Return 404 if project doesn't exist or doesn't belong to user (don't leak existence)
    if (!project || project.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
