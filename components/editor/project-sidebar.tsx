"use client"

import { Plus, X } from "lucide-react"

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

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  return (
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
          <EmptyProjectState label="No projects yet." />
        </TabsContent>
        <TabsContent value="shared" className="min-h-0">
          <EmptyProjectState label="No shared projects yet." />
        </TabsContent>
      </Tabs>

      <div className="border-t border-sidebar-border p-4">
        <Button type="button" className="w-full">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
