import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getCurrentIdentity() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user?.primaryEmailAddress?.emailAddress) {
    return null;
  }

  return {
    userId,
    email: user.primaryEmailAddress.emailAddress,
  };
}

export async function checkProjectAccess(projectId: string) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) {
    return null;
  }

  const isOwner = project.ownerId === identity.userId;
  const isCollaborator = project.collaborators.some(
    (collab) => collab.email.toLowerCase() === identity.email.toLowerCase()
  );

  if (!isOwner && !isCollaborator) {
    return null;
  }

  return project;
}
