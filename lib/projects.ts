import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getProjectsForUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return { owned: [], shared: [] };
  }

  try {
    // Get owned projects
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get shared projects (where user is a collaborator, excluding owned projects)
    let sharedProjects: typeof ownedProjects = [];
    const primaryEmail = user?.primaryEmailAddress?.emailAddress
      .trim()
      .toLowerCase();

    if (primaryEmail) {
      sharedProjects = await prisma.project.findMany({
        where: {
          AND: [
            {
              collaborators: {
                some: {
                  email: primaryEmail,
                },
              },
            },
            {
              // Exclude owned projects to avoid duplication
              ownerId: { not: userId },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Transform to match ProjectItem format
    const owned = ownedProjects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.id, // Use project ID as slug (already a room ID)
      access: 'owned' as const,
    }));

    const shared = sharedProjects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.id,
      access: 'shared' as const,
    }));

    return { owned, shared };
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Re-throw to let error boundary handle it
    throw error;
  }
}
