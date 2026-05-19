"use client"

import * as React from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, PanelRightOpen, Save, Share2, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { CanvasSaveStatus } from '@/hooks/useCanvasAutosave';

type WorkspaceNavbarProps = {
  projectName: string;
  saveStatus: CanvasSaveStatus;
  onShareProject: () => void;
  onSaveProject: () => void;
  onToggleAiSidebar: () => void;
  onOpenTemplates?: () => void;
};

export function WorkspaceNavbar({
  projectName,
  saveStatus,
  onShareProject,
  onSaveProject,
  onToggleAiSidebar,
  onOpenTemplates,
}: WorkspaceNavbarProps) {
  const [buttonStatus, setButtonStatus] = React.useState<'idle' | CanvasSaveStatus>('idle');
  const previousSaveStatusRef = React.useRef(saveStatus);

  React.useEffect(() => {
    const previousSaveStatus = previousSaveStatusRef.current;
    previousSaveStatusRef.current = saveStatus;

    if (saveStatus === 'saving') {
      setButtonStatus('saving');
      return;
    }

    if (previousSaveStatus !== 'saving') {
      return;
    }

    setButtonStatus(saveStatus);
    const timeoutId = window.setTimeout(() => {
      setButtonStatus('idle');
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [saveStatus]);

  const SaveStatusIcon =
    buttonStatus === 'saving'
      ? LoaderCircle
      : buttonStatus === 'error'
        ? CircleAlert
        : buttonStatus === 'saved'
          ? CircleCheck
          : Save;
  const saveStatusLabel =
    buttonStatus === 'saving'
      ? 'Saving ...'
      : buttonStatus === 'error'
        ? 'Error'
        : buttonStatus === 'saved'
          ? 'Saved'
          : 'Save';

  return (
    <header className="grid h-12 shrink-0 grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-background/95 px-4">
      <h1 className="truncate text-sm font-semibold">{projectName}</h1>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          aria-label={saveStatusLabel}
          disabled={buttonStatus === 'saving'}
          onClick={onSaveProject}
        >
          <SaveStatusIcon
            className={buttonStatus === 'saving' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
          />
          <span className="hidden text-xs sm:inline">{saveStatusLabel}</span>
        </Button>
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
