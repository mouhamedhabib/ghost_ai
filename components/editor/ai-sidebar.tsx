"use client"

import * as React from "react"
import { Bot, Download, FileText, Loader2, Send, Sparkles, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAiStatus } from "@/components/editor/ai-status-context"
import { useAiChat } from "@/components/editor/ai-chat-context"
import type { AiChatMessage } from "@/types/tasks"

type AiSidebarProps = {
  isOpen: boolean
  onClose: () => void
  projectId: string
  className?: string
}

function formatChatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

function ChatBubble({
  message,
  isOwn,
}: {
  message: AiChatMessage
  isOwn: boolean
}) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6",
          isOwn && isUser && "bg-[#62C073] text-black",
          isOwn && isAssistant && "border-2 border-brand/50 bg-brand-dim text-copy-primary",
          !isOwn && isUser && "border border-surface-border bg-elevated text-accent-text",
          !isOwn && isAssistant && "border border-surface-border bg-elevated text-accent-text"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            isOwn && isUser && "text-black/70",
            isOwn && isAssistant && "text-copy-primary/70",
            !isOwn && "text-muted-text"
          )}
        >
          <span className="font-medium">{message.sender}</span>
          <span>{formatChatTime(message.createdAt)}</span>
        </div>
        <p className="mt-0.5">{message.content}</p>
      </div>
    </div>
  )
}

function AiArchitectTab({ projectId }: { projectId: string }) {
  const { user } = useUser()
  const { messages, sendMessage, addAssistantMessage, error } = useAiChat()
  const { status } = useAiStatus()
  const [draft, setDraft] = React.useState("")
  const [runId, setRunId] = React.useState<string | null>(null)
  const [publicToken, setPublicToken] = React.useState<string | null>(null)

  const currentUserName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Anonymous"

  const isAiActive =
    status.message !== null &&
    (status.message.kind === "started" || status.message.kind === "processing")

  const { run: activeRun } = useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: async (run) => {
      if (run.status === "COMPLETED") {
        await addAssistantMessage(
          "Ghost AI finished shaping the canvas. Check the workspace for updates."
        )
      } else if (run.status === "FAILED" || run.status === "CANCELED") {
        const errorMsg =
          run.error?.message ?? "Ghost AI encountered an error."
        await addAssistantMessage(errorMsg)
      }
      setRunId(null)
      setPublicToken(null)
    },
  })

  const isRunActive =
    !!activeRun &&
    (activeRun.status === "QUEUED" || activeRun.status === "EXECUTING")

  const isDisabled = !draft.trim() || isRunActive

  const submitMessage = React.useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()
      if (!trimmedContent || isRunActive) return

      await sendMessage(trimmedContent)
      setDraft("")

      try {
        const response = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmedContent,
            roomId: projectId,
            projectId,
          }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(
            payload?.error ?? "Ghost AI could not start the design task."
          )
        }

        const data = (await response.json()) as {
          runId: string
          publicToken: string
        }
        setRunId(data.runId)
        setPublicToken(data.publicToken)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ghost AI could not start."
        await addAssistantMessage(message)
      }
    },
    [sendMessage, addAssistantMessage, projectId, isRunActive]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-surface-border bg-elevated text-accent-text">
              <Bot className="h-5 w-5" />
            </div>
            <p className="max-w-56 text-sm font-medium text-primary-text">
              Ask Ghost AI to shape your workspace. Messages are visible to everyone in the room.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isOwn={message.sender === currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      {isRunActive && (
        <div className="flex items-center gap-2 border-t border-surface-border bg-zinc-950 px-4 py-2 text-xs text-[#62C073]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#62C073] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#62C073]" />
          </span>
          <span className="font-medium">Ghost AI is working</span>
        </div>
      )}

      <form
        className="border-t border-surface-border p-4"
        onSubmit={(event) => {
          event.preventDefault()
          submitMessage(draft)
        }}
      >
        <div className="grid gap-2">
          {error && (
            <p className="text-xs text-red-400">Failed to send: {error}</p>
          )}
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submitMessage(draft)
              }
            }}
            placeholder={
              isRunActive
                ? "Ghost AI is working..."
                : "Ask Ghost AI to plan the workspace..."
            }
            className="max-h-40 min-h-[72px] resize-none border-surface-border bg-elevated text-primary-text placeholder:text-muted-text"
            disabled={isRunActive}
          />
          <Button
            type="submit"
            className="justify-self-end bg-[#62C073] text-white hover:bg-[#62C073]/90"
            disabled={isDisabled}
          >
            {isRunActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send />
            )}
            {isRunActive ? "Generating" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  )
}

type SpecItem = {
  id: string
  createdAt: string
}

type SpecContentResponse = string

function SpecsTab({ projectId }: { projectId: string }) {
  const [specs, setSpecs] = React.useState<SpecItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedSpecId, setSelectedSpecId] = React.useState<string | null>(null)
  const [specContent, setSpecContent] = React.useState<SpecContentResponse | null>(null)
  const [contentLoading, setContentLoading] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [generateError, setGenerateError] = React.useState<string | null>(null)
  const [runId, setRunId] = React.useState<string | null>(null)
  const [publicToken, setPublicToken] = React.useState<string | null>(null)
  const { messages } = useAiChat()

  const fetchSpecs = React.useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/specs`)
      if (!response.ok) {
        const text = await response.text().catch(() => "")
        setError(
          text
            ? `Server error (${response.status})`
            : `Request failed (${response.status})`
        )
        return
      }
      const data = (await response.json()) as { specs: SpecItem[] }
      setSpecs(data.specs)
    } catch {
      setError("Failed to load specs. Check your connection.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: async (run) => {
      if (run.status === "COMPLETED") {
        await fetchSpecs()
      } else if (run.status === "FAILED" || run.status === "CANCELED") {
        setGenerateError(run.error?.message ?? "Ghost AI encountered an error generating the spec.")
      }
      setRunId(null)
      setPublicToken(null)
      setGenerating(false)
    },
  })

  React.useEffect(() => {
    fetchSpecs()
  }, [fetchSpecs])

  const openPreview = React.useCallback(async (specId: string) => {
    setSelectedSpecId(specId)
    setPreviewOpen(true)
    setContentLoading(true)
    setSpecContent(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/specs/${specId}/download`)
      if (!response.ok) throw new Error("Failed to load spec")
      const text = await response.text()
      setSpecContent(text)
    } catch {
      setSpecContent("Failed to load spec content.")
    } finally {
      setContentLoading(false)
    }
  }, [projectId])

  const download = React.useCallback((specId: string) => {
    const anchor = document.createElement("a")
    anchor.href = `/api/projects/${projectId}/specs/${specId}/download`
    anchor.download = `spec-${specId}.md`
    anchor.click()
  }, [projectId])

  const generateSpec = React.useCallback(async () => {
    setGenerateError(null)
    setGenerating(true)
    try {
      const canvasRes = await fetch(`/api/projects/${projectId}/canvas`)
      let nodes: unknown[] = []
      let edges: unknown[] = []
      if (canvasRes.ok) {
        const canvasData = (await canvasRes.json()) as {
          canvas: { nodes: unknown[]; edges: unknown[] } | null
        }
        if (canvasData.canvas) {
          nodes = canvasData.canvas.nodes
          edges = canvasData.canvas.edges
        }
      }

      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
        sender: m.sender,
      }))

      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: projectId, chatHistory, nodes, edges }),
      })

      if (!specRes.ok) {
        const body = (await specRes.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? `Spec generation failed (${specRes.status})`)
      }

      const data = (await specRes.json()) as { runId: string }
      
      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: data.runId }),
      })

      if (!tokenRes.ok) {
        throw new Error("Failed to authenticate spec generation task")
      }

      const tokenData = (await tokenRes.json()) as { token: string }
      
      setRunId(data.runId)
      setPublicToken(tokenData.token)
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate spec"
      )
      setGenerating(false)
    }
  }, [projectId, messages])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      {generateError && (
        <p className="text-xs text-red-400">{generateError}</p>
      )}
      <Button
        type="button"
        className="w-full bg-accent text-white hover:bg-accent/90"
        onClick={generateSpec}
        disabled={generating}
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles />}
        {generating ? "Generating..." : "Generate Spec"}
      </Button>

      <ScrollArea className="min-h-0 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-text" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={fetchSpecs}>
              Retry
            </Button>
          </div>
        ) : specs.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-surface-border bg-elevated text-accent-text">
              <FileText className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-text">No specs generated yet.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {specs.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => openPreview(spec.id)}
                className="flex w-full items-start gap-3 rounded-lg border border-surface-border bg-elevated p-3 text-left transition-colors hover:bg-subtle"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-surface-border bg-subtle text-accent-text">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-primary-text">
                    spec-{spec.id.slice(0, 8)}.md
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-text">
                    {new Date(spec.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Download spec"
                  onClick={(e) => {
                    e.stopPropagation()
                    download(spec.id)
                  }}
                >
                  <Download />
                </Button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-text">
              {selectedSpecId ? `spec-${selectedSpecId.slice(0, 8)}.md` : "Spec Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => selectedSpecId && download(selectedSpecId)}
            >
              <Download />
              Download
            </Button>
          </div>
          <ScrollArea className="max-h-[60vh]">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-text" />
              </div>
            ) : specContent ? (
              <div className="prose prose-sm prose-invert max-w-none px-1 py-2 text-primary-text">
                <ReactMarkdown>{specContent}</ReactMarkdown>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-text">
                No content available.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AiSidebar({ isOpen, onClose, projectId, className }: AiSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-l border-surface-border bg-base/95 text-primary-text shadow-2xl shadow-background/50 transition-transform duration-200 ease-out md:relative md:z-auto md:w-80 md:shadow-none",
        isOpen ? "translate-x-0" : "pointer-events-none translate-x-full md:absolute",
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-subtle text-accent-text">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-primary-text">
              AI Workspace
            </h2>
            <p className="truncate text-xs text-muted-text">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close AI sidebar"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0">
        <div className="border-b border-surface-border px-4 py-3">
          <TabsList className="grid w-full grid-cols-2 bg-subtle">
            <TabsTrigger
              value="architect"
              className="text-muted-text data-active:bg-accent data-active:text-accent-foreground"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="text-muted-text data-active:bg-accent data-active:text-accent-foreground"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="architect" className="min-h-0 data-[state=inactive]:hidden">
          <AiArchitectTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="specs" className="min-h-0 data-[state=inactive]:hidden">
          <SpecsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
