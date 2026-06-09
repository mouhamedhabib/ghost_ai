"use client"

import * as React from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { AiSidebar } from "@/components/editor/ai-sidebar"
import { EditorCanvas } from "@/components/editor/canvas"
import { ProjectDialogProvider } from "@/components/editor/project-dialog-provider"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { CanvasSaveStatus } from "@/hooks/useCanvasAutosave"
import {
  useProjectDialogContext,
} from "@/components/editor/project-dialog-provider"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { Button } from "@/components/ui/button"
import type { ProjectItem } from "@/components/editor/use-project-dialogs"
import { useUser } from "@clerk/nextjs"
import { AiStatusProvider } from "@/components/editor/ai-status-context"
import { AiChatProvider } from "@/components/editor/ai-chat-context"

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
  const [saveStatus, setSaveStatus] = React.useState<CanvasSaveStatus>("saved");
  const importTemplateRef = React.useRef<(template: CanvasTemplate) => void>(() => { });
  const saveCanvasRef = React.useRef<() => Promise<void>>(async () => { });

  const handleCanvasReady = React.useCallback((importFn: (template: CanvasTemplate) => void) => {
    importTemplateRef.current = importFn;
  }, []);

  const handleImportTemplate = React.useCallback((template: CanvasTemplate) => {
    importTemplateRef.current(template);
  }, []);

  const handleSaveCanvasReady = React.useCallback((saveNow: () => Promise<void>) => {
    saveCanvasRef.current = saveNow;
  }, []);

  const handleSaveProject = React.useCallback(() => {
    void saveCanvasRef.current();
  }, []);

  const { user } = useUser()

  const userName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Anonymous"

  return (
    <ProjectDialogProvider>
      <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <WorkspaceProjectInitializer initialProjects={initialProjects} />
        <WorkspaceNavbar
          projectName={projectName}
          saveStatus={saveStatus}
          onShareProject={() => setIsShareDialogOpen(true)}
          onSaveProject={handleSaveProject}
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

        <AiChatProvider roomId={projectId} userName={userName}>
        <AiStatusProvider>
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
              onSaveStatusChange={setSaveStatus}
              onSaveNowReady={handleSaveCanvasReady}
            />
          </main>

          <AiSidebar
            isOpen={isAiSidebarOpen}
            onClose={() => setIsAiSidebarOpen(false)}
            projectId={projectId}
          />
          </div>
        </AiStatusProvider>
        </AiChatProvider>
      </div>
    </ProjectDialogProvider>
  );
}
