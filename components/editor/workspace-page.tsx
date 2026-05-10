"use client"

import { useState } from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, Zap, Plus, Pencil, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkspaceNavbar } from '@/components/editor/workspace-navbar';
import { ProjectDialogProvider } from '@/components/editor/project-dialog-provider';
import { useProjectDialogContext } from '@/components/editor/project-dialog-provider';
import { cn } from '@/lib/utils';

type WorkspacePageProps = {
  projectId: string;
  projectName: string;
};

function ProjectListForWorkspace({
  access,
  currentRoomId,
}: {
  access: "owned" | "shared"
  currentRoomId?: string
}) {
  const { openDeleteDialog, openRenameDialog, projects } = useProjectDialogContext();
  const scopedProjects = projects.filter((project) => project.access === access);

  if (scopedProjects.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
        {access === "owned" ? "No projects yet." : "No shared projects yet."}
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      {scopedProjects.map((project) => (
        <Link
          key={project.id}
          href={`/editor/${project.id}`}
          className={cn(
            "group flex min-h-12 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
            project.id === currentRoomId && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {project.name}
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/70">
              {project.slug}
            </span>
          </div>
          {project.access === "owned" ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Rename ${project.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openRenameDialog(project);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${project.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openDeleteDialog(project);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function WorkspaceSidebarContent({ currentRoomId }: { currentRoomId?: string }) {
  const { openCreateDialog } = useProjectDialogContext();

  return (
    <>
      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-3 p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="min-h-0">
          <ProjectListForWorkspace access="owned" currentRoomId={currentRoomId} />
        </TabsContent>
        <TabsContent value="shared" className="min-h-0">
          <ProjectListForWorkspace access="shared" currentRoomId={currentRoomId} />
        </TabsContent>
      </Tabs>

      <div className="border-t border-sidebar-border p-4">
        <Button
          type="button"
          className="w-full"
          onClick={() => openCreateDialog()}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </>
  );
}

function WorkspaceSidebar({ currentRoomId }: { currentRoomId?: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center px-4 border-b border-sidebar-border">
      <h2 className="text-sm font-medium">Projects</h2>
    </div>
  );
}

export function WorkspacePage({
  projectId,
  projectName,
}: WorkspacePageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

  return (
    <ProjectDialogProvider>
      <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <WorkspaceNavbar
          projectName={projectName}
          onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Left Sidebar - Projects */}
          <div className="hidden md:flex md:flex-col">
            <button
              type="button"
              aria-label="Close project sidebar"
              tabIndex={isSidebarOpen ? 0 : -1}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "fixed inset-0 z-30 bg-background/65 transition-opacity duration-200 md:hidden",
                isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            />
            <aside
              aria-hidden={!isSidebarOpen}
              inert={!isSidebarOpen}
              className={cn(
                "fixed top-12 bottom-0 left-0 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl shadow-background/50 transition-transform duration-200 ease-out md:relative md:top-0 md:bottom-auto md:w-64 md:translate-x-0 md:shadow-none",
                isSidebarOpen ? "translate-x-0" : "pointer-events-none -translate-x-[calc(100%+2rem)] md:pointer-events-auto"
              )}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border px-4 md:hidden">
                <h2 className="text-sm font-medium">Projects</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close project sidebar"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden md:flex h-12 shrink-0 items-center px-4">
                <h2 className="text-sm font-medium">Projects</h2>
              </div>

              <WorkspaceSidebarContent currentRoomId={projectId} />
            </aside>
          </div>

          {/* Sidebar Toggle Button */}
          <div className="absolute top-0 left-0 z-50 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
              aria-pressed={isSidebarOpen}
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="rounded-none border-b border-r border-border"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Canvas Area */}
          <main className="relative min-h-0 flex-1 overflow-hidden bg-background">
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Canvas coming soon
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar - AI Chat Placeholder */}
          <aside
            className={cn(
              "flex w-80 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out",
              isAiSidebarOpen ? "translate-x-0" : "absolute w-0 translate-x-full pointer-events-none md:relative"
            )}
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
              <h2 className="text-sm font-medium">AI Assistant</h2>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <p className="text-sm text-sidebar-foreground/60">
                AI chat coming soon
              </p>
            </div>
          </aside>
        </div>
      </div>
    </ProjectDialogProvider>
  );
}
