"use client"

import * as React from "react"

import type { CanvasEdge, CanvasNode, CanvasState } from "@/types/canvas"

export type CanvasSaveStatus = "saving" | "saved" | "error"

type UseCanvasAutosaveOptions = {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  debounceMs?: number
}

type SaveCanvasOptions = {
  immediate?: boolean
}

const DEFAULT_DEBOUNCE_MS = 1200

async function saveCanvasState(projectId: string, canvas: CanvasState) {
  try {
    const response = await fetch(`/api/projects/${projectId}/canvas`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(canvas),
    })

    if (response.ok) {
      return true
    }

    let message = "Failed to save canvas"

    try {
      const payload = (await response.json()) as { error?: unknown }

      if (typeof payload.error === "string") {
        message = payload.error
      }
    } catch {
      message = response.statusText || message
    }

    console.warn(`Canvas autosave failed: ${message}`)
    return false
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.warn(`Canvas autosave request failed: ${message}`)
    return false
  }
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = React.useState<CanvasSaveStatus>("saved")
  const hasMountedRef = React.useRef(false)
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestCanvasRef = React.useRef<CanvasState>({ nodes, edges })

  React.useEffect(() => {
    latestCanvasRef.current = { nodes, edges }
  }, [nodes, edges])

  const clearPendingSave = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
  }, [])

  const save = React.useCallback(
    async ({ immediate = false }: SaveCanvasOptions = {}) => {
      clearPendingSave()
      setStatus("saving")

      const canvas = latestCanvasRef.current

      const didSave = await saveCanvasState(projectId, canvas)

      if (didSave) {
        setStatus("saved")
      } else {
        setStatus("error")
      }

      if (immediate) {
        return
      }
    },
    [clearPendingSave, projectId]
  )

  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    clearPendingSave()
    setStatus("saving")
    saveTimeoutRef.current = setTimeout(() => {
      void save()
    }, debounceMs)

    return clearPendingSave
  }, [clearPendingSave, debounceMs, edges, nodes, save])

  React.useEffect(() => clearPendingSave, [clearPendingSave])

  return {
    status,
    saveNow: React.useCallback(() => save({ immediate: true }), [save]),
  }
}
