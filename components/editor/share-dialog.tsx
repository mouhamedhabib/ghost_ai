"use client"

import * as React from "react"
import { Check, Copy, Loader2, Mail, Trash2, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type ShareCollaborator = {
  id: string
  email: string
  createdAt: string
  displayName: string | null
  avatarUrl: string | null
}

type ShareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  canManage: boolean
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  canManage: initialCanManage,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = React.useState<ShareCollaborator[]>(
    []
  )
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [canManage, setCanManage] = React.useState(initialCanManage)
  const [isCopied, setIsCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isInviting, setIsInviting] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<string | null>(null)
  const [projectUrl, setProjectUrl] = React.useState(`/editor/${projectId}`)

  const loadCollaborators = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`)

      if (!response.ok) {
        throw new Error("Unable to load sharing settings.")
      }

      const data = (await response.json()) as {
        collaborators: ShareCollaborator[]
        canManage: boolean
      }

      setCollaborators(data.collaborators)
      setCanManage(data.canManage)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load sharing settings."
      )
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    setProjectUrl(`${window.location.origin}/editor/${projectId}`)
  }, [projectId])

  React.useEffect(() => {
    if (open) {
      void loadCollaborators()
    }
  }, [loadCollaborators, open])

  React.useEffect(() => {
    if (!isCopied) {
      return
    }

    const timeoutId = window.setTimeout(() => setIsCopied(false), 1600)

    return () => window.clearTimeout(timeoutId)
  }, [isCopied])

  async function copyProjectLink() {
    await navigator.clipboard.writeText(projectUrl)
    setIsCopied(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
  }

  async function inviteCollaborator(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canManage || isInviting) {
      return
    }

    setIsInviting(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null

        throw new Error(data?.error || "Unable to invite collaborator.")
      }

      const collaborator = (await response.json()) as ShareCollaborator

      setCollaborators((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.id !== collaborator.id
        )

        return [...withoutDuplicate, collaborator]
      })
      setEmail("")
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite collaborator."
      )
    } finally {
      setIsInviting(false)
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    if (!canManage || removingId) {
      return
    }

    setRemovingId(collaboratorId)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null

        throw new Error(data?.error || "Unable to remove collaborator.")
      }

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId)
      )
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove collaborator."
      )
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {projectName}</DialogTitle>
          <DialogDescription>
            Manage who can open this editor workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {canManage ? (
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="project-link">
                Project link
              </label>
              <div className="flex gap-2">
                <Input id="project-link" value={projectUrl} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyProjectLink}
                  className="min-w-24"
                >
                  {isCopied ? <Check /> : <Copy />}
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ) : null}

          {canManage ? (
            <form className="grid gap-2" onSubmit={inviteCollaborator}>
              <label className="text-sm font-medium" htmlFor="collaborator-email">
                Invite collaborator
              </label>
              <div className="flex gap-2">
                <Input
                  id="collaborator-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="designer@example.com"
                  disabled={isInviting}
                />
                <Button
                  type="submit"
                  disabled={isInviting || email.trim().length === 0}
                  className="min-w-24"
                >
                  {isInviting ? <Loader2 className="animate-spin" /> : <Mail />}
                  Invite
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              You have view-only access to collaborators for this project.
            </div>
          )}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Collaborators</h3>
            <ScrollArea className="max-h-72 rounded-lg border border-border">
              <div className="grid gap-1 p-2">
                {isLoading ? (
                  <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 animate-spin" />
                    Loading collaborators
                  </div>
                ) : collaborators.length === 0 ? (
                  <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
                    No collaborators yet.
                  </div>
                ) : (
                  collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex min-h-12 items-center gap-3 rounded-lg px-2 py-1.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {collaborator.avatarUrl ? (
                          <div
                            aria-hidden="true"
                            className="size-full object-cover"
                            style={{
                              backgroundImage: `url(${collaborator.avatarUrl})`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }}
                          />
                        ) : (
                          <UserRound className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {collaborator.displayName || collaborator.email}
                        </p>
                        {collaborator.displayName ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {collaborator.email}
                          </p>
                        ) : null}
                      </div>
                      {canManage ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${collaborator.email}`}
                          disabled={removingId !== null}
                          onClick={() => removeCollaborator(collaborator.id)}
                          className={cn(
                            "text-muted-foreground",
                            removingId === collaborator.id && "opacity-70"
                          )}
                        >
                          {removingId === collaborator.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
