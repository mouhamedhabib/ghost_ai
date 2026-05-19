"use client"

import * as React from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { EditorCanvas } from "@/components/editor/canvas"
import { ProjectDialogProvider } from "@/components/editor/project-dialog-provider"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import {
  useProjectDialogContext,
} from "@/components/editor/project-dialog-provider"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProjectItem } from "@/components/editor/use-project-dialogs"

type WorkspacePageProps = {
  projectId: string;
  projectName: string;
  initialProjects: ProjectItem[];
  canManageSharing: boolean;
};

function WorkspaceProjectInitializer({
  initialProjects,
}: {
  initialProjects: ProjectItem[];
}) {
  const { setInitialProjects } = useProjectDialogContext();

  React.useEffect(() => {
    setInitialProjects(initialProjects);
  }, [initialProjects, setInitialProjects]);

  return null;
}

export function WorkspacePage({
  projectId,
  projectName,
  initialProjects,
  canManageSharing,
}: WorkspacePageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = React.useState(false);
  const importTemplateRef = React.useRef<(template: CanvasTemplate) => void>(() => { });

  const handleCanvasReady = React.useCallback((importFn: (template: CanvasTemplate) => void) => {
    importTemplateRef.current = importFn;
  }, []);

  const handleImportTemplate = React.useCallback((template: CanvasTemplate) => {
    importTemplateRef.current(template);
  }, []);

  return (
    <ProjectDialogProvider>
      <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <WorkspaceProjectInitializer initialProjects={initialProjects} />
        <WorkspaceNavbar
          projectName={projectName}
          onShareProject={() => setIsShareDialogOpen(true)}
          onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        />
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          projectId={projectId}
          projectName={projectName}
          canManage={canManageSharing}
        />
        <StarterTemplatesModal
          open={isTemplatesModalOpen}
          onOpenChange={setIsTemplatesModalOpen}
          onImport={handleImportTemplate}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentRoomId={projectId}
            variant="workspace"
          />

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

          <main className="relative min-h-0 flex-1 overflow-hidden bg-zinc-950">
            <EditorCanvas
              roomId={projectId}
              onCanvasReady={handleCanvasReady}
            />
          </main>

          <aside
            className={cn(
              "absolute inset-y-0 right-0 z-30 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl shadow-background/50 transition-transform duration-200 ease-out md:relative md:z-auto md:w-80 md:shadow-none",
              isAiSidebarOpen
                ? "translate-x-0"
                : "pointer-events-none translate-x-full md:absolute"
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
