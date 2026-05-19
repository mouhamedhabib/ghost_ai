import { clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

type CollaboratorRecord = {
  id: string
  email: string
  createdAt: Date
}

export type EnrichedCollaborator = {
  id: string
  email: string
  createdAt: string
  displayName: string | null
  avatarUrl: string | null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getUserDisplayName(user: {
  firstName: string | null
  lastName: string | null
  fullName: string | null
  username: string | null
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()

  return user.fullName || name || user.username || null
}

export function isValidCollaboratorEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))
}

export async function getProjectForCollaboratorAccess(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: { orderBy: { createdAt: "asc" } } },
  })
}

export async function enrichCollaborators(
  collaborators: CollaboratorRecord[]
): Promise<EnrichedCollaborator[]> {
  const emails = collaborators.map((collaborator) =>
    normalizeEmail(collaborator.email)
  )
  const usersByEmail = new Map<
    string,
    {
      firstName: string | null
      lastName: string | null
      fullName: string | null
      username: string | null
      imageUrl: string
    }
  >()

  if (emails.length > 0) {
    try {
      const client = await clerkClient()
      const users = await client.users.getUserList({
        emailAddress: emails,
        limit: Math.min(emails.length, 500),
      })

      for (const user of users.data) {
        for (const emailAddress of user.emailAddresses) {
          usersByEmail.set(normalizeEmail(emailAddress.emailAddress), user)
        }
      }
    } catch (error) {
      console.error("Error enriching collaborators from Clerk:", error)
    }
  }

  return collaborators.map((collaborator) => {
    const email = normalizeEmail(collaborator.email)
    const user = usersByEmail.get(email)

    return {
      id: collaborator.id,
      email,
      createdAt: collaborator.createdAt.toISOString(),
      displayName: user ? getUserDisplayName(user) : null,
      avatarUrl: user?.imageUrl || null,
    }
  })
}

export async function listProjectCollaborators(projectId: string) {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })

  return enrichCollaborators(collaborators)
}

export async function inviteProjectCollaborator(
  projectId: string,
  email: string
) {
  const normalizedEmail = normalizeEmail(email)

  return prisma.projectCollaborator.upsert({
    where: {
      projectId_email: {
        projectId,
        email: normalizedEmail,
      },
    },
    create: {
      projectId,
      email: normalizedEmail,
    },
    update: {},
  })
}
