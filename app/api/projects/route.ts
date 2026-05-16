import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects - list current user's projects
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - create project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body with error handling
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate and process name
    let projectName = 'Untitled Project';
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          { error: 'Field name must be a string' },
          { status: 400 }
        );
      }
      if (body.name.length === 0) {
        // Empty string falls back to default
        projectName = 'Untitled Project';
      } else if (body.name.length > 255) {
        return NextResponse.json(
          { error: 'Field name must not exceed 255 characters' },
          { status: 400 }
        );
      } else {
        projectName = body.name;
      }
    }

    // Validate description
    let description = null;
    if (body.description !== undefined) {
      if (body.description === null) {
        description = null;
      } else if (typeof body.description !== 'string') {
        return NextResponse.json(
          { error: 'Field description must be a string or null' },
          { status: 400 }
        );
      } else if (body.description.length > 1000) {
        return NextResponse.json(
          { error: 'Field description must not exceed 1000 characters' },
          { status: 400 }
        );
      } else {
        description = body.description;
      }
    }

    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description,
        ownerId: userId,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
