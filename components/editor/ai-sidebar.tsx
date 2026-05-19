"use client"

import * as React from "react"
import { Bot, Download, FileText, Send, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type AiSidebarProps = {
  isOpen: boolean
  onClose: () => void
  className?: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

function EmptyArchitectState({
  onStarterPrompt,
}: {
  onStarterPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-surface-border bg-elevated text-accent-text">
        <Bot className="h-5 w-5" />
      </div>
      <p className="max-w-56 text-sm font-medium text-primary-text">
        Start with a systems prompt and Ghost AI will help shape the workspace.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onStarterPrompt(prompt)}
            className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-accent-text transition-colors hover:bg-subtle/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6",
          isUser
            ? "border-2 border-brand/50 bg-brand-dim text-copy-primary"
            : "border border-surface-border bg-elevated text-accent-text"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

function AiArchitectTab() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [draft, setDraft] = React.useState("")

  const submitMessage = React.useCallback((content: string) => {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedContent,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I can help turn this into workspace-ready architecture steps.",
      },
    ])
    setDraft("")
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <EmptyArchitectState
            onStarterPrompt={(prompt) => {
              setDraft(prompt)
            }}
          />
        ) : (
          <div className="grid gap-3">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <form
        className="border-t border-surface-border p-4"
        onSubmit={(event) => {
          event.preventDefault()
          submitMessage(draft)
        }}
      >
        <div className="grid gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submitMessage(draft)
              }
            }}
            placeholder="Ask Ghost AI to plan the workspace..."
            className="max-h-40 min-h-[72px] resize-none border-surface-border bg-elevated text-primary-text placeholder:text-muted-text"
          />
          <Button
            type="submit"
            className="justify-self-end bg-accent text-white hover:bg-accent/90"
            disabled={!draft.trim()}
          >
            <Send />
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <Button type="button" className="w-full bg-accent text-white hover:bg-accent/90">
        <Sparkles />
        Generate Spec
      </Button>

      <div className="rounded-lg border border-surface-border bg-elevated p-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-surface-border bg-subtle text-accent-text">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-primary-text">
              Workspace architecture spec
            </h3>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-text">
              Static preview for the future generated specification, including system boundaries,
              core services, integrations, and delivery milestones.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Download spec"
            disabled
          >
            <Download />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AiSidebar({ isOpen, onClose, className }: AiSidebarProps) {
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
          <AiArchitectTab />
        </TabsContent>
        <TabsContent value="specs" className="min-h-0 data-[state=inactive]:hidden">
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
