"use client"

import { Share2, PanelRightOpen, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

type WorkspaceNavbarProps = {
  projectName: string;
  onShareProject: () => void;
  onToggleAiSidebar: () => void;
  onOpenTemplates?: () => void;
};

export function WorkspaceNavbar({
  projectName,
  onShareProject,
  onToggleAiSidebar,
  onOpenTemplates,
}: WorkspaceNavbarProps) {
  return (
    <header className="grid h-12 shrink-0 grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-background/95 px-4">
      <h1 className="truncate text-sm font-semibold">{projectName}</h1>

      <div className="flex items-center gap-1">
        {onOpenTemplates && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Import starter template"
            onClick={onOpenTemplates}
          >
            <Zap className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Share project"
          onClick={onShareProject}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle AI sidebar"
          onClick={onToggleAiSidebar}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
