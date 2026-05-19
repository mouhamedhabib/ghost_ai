"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export type ProjectItem = {
  id: string
  name: string
  slug: string
  access: "owned" | "shared"
}

type ProjectDialog =
  | { type: "create" }
  | { type: "rename"; project: ProjectItem }
  | { type: "delete"; project: ProjectItem }

export function createProjectSlug(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  )
}

export function useProjectDialogs() {
  const router = useRouter()
  const [projects, setProjects] = React.useState<ProjectItem[]>([])
  const [dialog, setDialog] = React.useState<ProjectDialog | null>(null)
  const [projectName, setProjectName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const slugPreview = React.useMemo(
    () => createProjectSlug(projectName),
    [projectName]
  )

  const closeDialog = React.useCallback(() => {
    if (isLoading) {
      return
    }

    setDialog(null)
    setProjectName("")
  }, [isLoading])

  const openCreateDialog = React.useCallback(() => {
    setProjectName("")
    setDialog({ type: "create" })
  }, [])

  const openRenameDialog = React.useCallback((project: ProjectItem) => {
    setProjectName(project.name)
    setDialog({ type: "rename", project })
  }, [])

  const openDeleteDialog = React.useCallback((project: ProjectItem) => {
    setProjectName(project.name)
    setDialog({ type: "delete", project })
  }, [])

  const setInitialProjects = React.useCallback((initialProjects: ProjectItem[]) => {
    setProjects(initialProjects)
  }, [])

  const submitDialog = React.useCallback(async () => {
    if (isLoading) {
      return
    }

    if (!dialog) {
      return
    }

    const trimmedName = projectName.trim()

    if (dialog.type !== "delete" && !trimmedName) {
      return
    }

    setIsLoading(true)

    try {
      if (dialog.type === "create") {
        // POST /api/projects
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        })

        if (!response.ok) {
          throw new Error("Failed to create project")
        }

        const newProject = await response.json()
        const projectItem: ProjectItem = {
          id: newProject.id,
          name: newProject.name,
          slug: newProject.id,
          access: "owned",
        }

        setProjects((current) => [projectItem, ...current])
        setDialog(null)
        setProjectName("")

        // Navigate to the new project workspace
        router.push(`/editor/${newProject.id}`)
      } else if (dialog.type === "rename") {
        // PATCH /api/projects/[id]
        const response = await fetch(`/api/projects/${dialog.project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        })

        if (!response.ok) {
          throw new Error("Failed to rename project")
        }

        setProjects((current) =>
          current.map((project) =>
            project.id === dialog.project.id
              ? { ...project, name: trimmedName }
              : project
          )
        )
        setDialog(null)
        setProjectName("")
      } else if (dialog.type === "delete") {
        // DELETE /api/projects/[id]
        const response = await fetch(`/api/projects/${dialog.project.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete project")
        }

        setProjects((current) =>
          current.filter((project) => project.id !== dialog.project.id)
        )
        setDialog(null)
        setProjectName("")

        // Redirect if deleting active workspace (check if currently on /editor/[id])
        if (window.location.pathname.startsWith(`/editor/${dialog.project.id}`)) {
          router.push("/editor")
        }
      }
    } catch (error) {
      console.error("Dialog submission error:", error)
      // Optionally show error to user here
    } finally {
      setIsLoading(false)
    }
  }, [dialog, isLoading, projectName, router])

  return {
    dialog,
    isLoading,
    projectName,
    projects,
    slugPreview,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    setProjectName,
    submitDialog,
    setInitialProjects,
  }
}

export type ProjectDialogsState = ReturnType<typeof useProjectDialogs>
