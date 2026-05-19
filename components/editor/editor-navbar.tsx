"use client"

import { PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { clerkAppearance } from "@/lib/clerk-appearance"
import { cn } from "@/lib/utils"

type EditorNavbarProps = {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenStarterTemplates?: () => void
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  onOpenStarterTemplates,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header
      className={cn(
        "grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background/95 px-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          aria-pressed={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <SidebarIcon />
        </Button>
      </div>

      <div className="flex min-w-0 items-center justify-center gap-2">
        {onOpenStarterTemplates && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Import starter template"
            onClick={onOpenStarterTemplates}
          >
            <Zap className="size-4" />
            <span className="hidden sm:inline text-xs">Templates</span>
          </Button>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-end">
        <UserButton
          appearance={clerkAppearance}
          userProfileProps={{ appearance: clerkAppearance }}
        />
      </div>
    </header>
  )
}
