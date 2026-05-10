"use client"

import { Share2, PanelRightOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';

type WorkspaceNavbarProps = {
  projectName: string;
  onToggleAiSidebar: () => void;
};

export function WorkspaceNavbar({
  projectName,
  onToggleAiSidebar,
}: WorkspaceNavbarProps) {
  return (
    <header className="grid h-12 shrink-0 grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-background/95 px-4">
      <h1 className="truncate text-sm font-semibold">{projectName}</h1>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Share project"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
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
