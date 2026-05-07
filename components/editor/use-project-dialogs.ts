"use client"

import * as React from "react"

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

const mockProjects: ProjectItem[] = [
  {
    id: "atlas-house",
    name: "Atlas House",
    slug: "atlas-house",
    access: "owned",
  },
  {
    id: "courtyard-studio",
    name: "Courtyard Studio",
    slug: "courtyard-studio",
    access: "owned",
  },
  {
    id: "harbor-library",
    name: "Harbor Library",
    slug: "harbor-library",
    access: "shared",
  },
]

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
  const [projects, setProjects] = React.useState<ProjectItem[]>(mockProjects)
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

  const submitDialog = React.useCallback(() => {
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

    window.setTimeout(() => {
      if (dialog.type === "create") {
        const nextProject: ProjectItem = {
          id: `${slugPreview}-${Date.now()}`,
          name: trimmedName,
          slug: slugPreview,
          access: "owned",
        }

        setProjects((current) => [nextProject, ...current])
      }

      if (dialog.type === "rename") {
        setProjects((current) =>
          current.map((project) =>
            project.id === dialog.project.id
              ? { ...project, name: trimmedName, slug: slugPreview }
              : project
          )
        )
      }

      if (dialog.type === "delete") {
        setProjects((current) =>
          current.filter((project) => project.id !== dialog.project.id)
        )
      }

      setIsLoading(false)
      setDialog(null)
      setProjectName("")
    }, 200)
  }, [dialog, isLoading, projectName, slugPreview])

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
  }
}

export type ProjectDialogsState = ReturnType<typeof useProjectDialogs>
