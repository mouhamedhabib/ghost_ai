"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { useProjectDialogContext } from "@/components/editor/project-dialog-provider"
import { Button } from "@/components/ui/button"

type ProjectItem = {
  id: string
  name: string
  slug: string
  access: "owned" | "shared"
}

type EditorHomeClientProps = {
  owned: ProjectItem[]
  shared: ProjectItem[]
}

export function EditorHomeClient({ owned, shared }: EditorHomeClientProps) {
  const { openCreateDialog, setInitialProjects } = useProjectDialogContext()

  // Set initial projects once when component mounts
  React.useEffect(() => {
    setInitialProjects([...owned, ...shared])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // Mount only - owned and shared are passed from parent server component

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--muted)_1px,transparent_1px)] bg-[length:24px_24px] opacity-20" />
      <div className="relative flex max-w-xl flex-col items-center gap-4 text-center">
        <div className="grid gap-2">
          <h1 className="text-2xl font-medium tracking-normal text-foreground sm:text-3xl">
            Create a project or open an existing one
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus aria-hidden="true" />
          New Project
        </Button>
      </div>
    </div>
  )
}
