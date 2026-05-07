"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { useProjectDialogContext } from "@/components/editor/project-dialog-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ProjectSidebarProps = {
  isOpen: boolean
  onClose: () => void
  className?: string
}

function EmptyProjectState({ label }: { label: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function ProjectList({
  access,
}: {
  access: "owned" | "shared"
}) {
  const {
    openDeleteDialog,
    openRenameDialog,
    projects,
  } = useProjectDialogContext()
  const scopedProjects = projects.filter((project) => project.access === access)

  if (scopedProjects.length === 0) {
    return (
      <EmptyProjectState
        label={access === "owned" ? "No projects yet." : "No shared projects yet."}
      />
    )
  }

  return (
    <div className="grid gap-1">
      {scopedProjects.map((project) => (
        <div
          key={project.id}
          className="group flex min-h-12 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <button
            type="button"
            className="min-w-0 flex-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
          >
            <span className="block truncate text-sm font-medium">
              {project.name}
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/70">
              {project.slug}
            </span>
          </button>
          {project.access === "owned" ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Rename ${project.name}`}
                onClick={() => openRenameDialog(project)}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${project.name}`}
                onClick={() => openDeleteDialog(project)}
              >
                <Trash2 />
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  const { openCreateDialog } = useProjectDialogContext()

  return (
    <>
      <button
        type="button"
        aria-label="Close project sidebar"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-background/65 transition-opacity duration-200 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed top-16 bottom-4 left-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl shadow-background/50 transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "pointer-events-none -translate-x-[calc(100%+2rem)]",
          className
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <h2 className="text-sm font-medium">Projects</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close project sidebar"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-3 p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="min-h-0">
            <ProjectList access="owned" />
          </TabsContent>
          <TabsContent value="shared" className="min-h-0">
            <ProjectList access="shared" />
          </TabsContent>
        </Tabs>

        <div className="border-t border-sidebar-border p-4">
          <Button type="button" className="w-full" onClick={openCreateDialog}>
            <Plus />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
