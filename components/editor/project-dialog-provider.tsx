"use client"

import * as React from "react"

import {
  EditorDialog,
  EditorDialogContent,
  EditorDialogDescription,
  EditorDialogFooter,
  EditorDialogHeader,
  EditorDialogTitle,
} from "@/components/editor/editor-dialog"
import {
  type ProjectDialogsState,
  useProjectDialogs,
} from "@/components/editor/use-project-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ProjectDialogContext = React.createContext<ProjectDialogsState | null>(
  null
)

export function useProjectDialogContext() {
  const context = React.useContext(ProjectDialogContext)

  if (!context) {
    throw new Error(
      "useProjectDialogContext must be used within ProjectDialogProvider"
    )
  }

  return context
}

type ProjectDialogProviderProps = {
  children: React.ReactNode
}

export function ProjectDialogProvider({
  children,
}: ProjectDialogProviderProps) {
  const projectDialogs = useProjectDialogs()
  const {
    closeDialog,
    dialog,
    isLoading,
    projectName,
    setProjectName,
    slugPreview,
    submitDialog,
  } = projectDialogs

  const dialogTitle =
    dialog?.type === "rename"
      ? "Rename Project"
      : dialog?.type === "delete"
        ? "Delete Project"
        : "Create Project"

  return (
    <ProjectDialogContext.Provider value={projectDialogs}>
      {children}
      <EditorDialog open={dialog !== null} onOpenChange={closeDialog}>
        <EditorDialogContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              submitDialog()
            }}
          >
            <EditorDialogHeader>
              <EditorDialogTitle>{dialogTitle}</EditorDialogTitle>
              {dialog?.type === "rename" ? (
                <EditorDialogDescription>
                  Current project name: {dialog.project.name}
                </EditorDialogDescription>
              ) : dialog?.type === "delete" ? (
                <EditorDialogDescription>
                  This will remove {dialog.project.name} from your mock project
                  list.
                </EditorDialogDescription>
              ) : (
                <EditorDialogDescription>
                  Name the architecture workspace you want to start.
                </EditorDialogDescription>
              )}
            </EditorDialogHeader>

            {dialog?.type !== "delete" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="project-name">
                  Project name
                </label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  autoFocus={true}
                  disabled={isLoading}
                  placeholder="Modern courtyard home"
                />
                <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
                  Slug preview:{" "}
                  <span className="font-medium text-foreground">
                    {slugPreview}
                  </span>
                </div>
              </div>
            ) : null}

            <EditorDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={dialog?.type === "delete" ? "destructive" : "default"}
                disabled={
                  isLoading ||
                  (dialog?.type !== "delete" && projectName.trim().length === 0)
                }
              >
                {isLoading
                  ? "Working..."
                  : dialog?.type === "rename"
                    ? "Rename Project"
                    : dialog?.type === "delete"
                      ? "Delete Project"
                      : "Create Project"}
              </Button>
            </EditorDialogFooter>
          </form>
        </EditorDialogContent>
      </EditorDialog>
    </ProjectDialogContext.Provider>
  )
}
