"use client"

import * as React from "react"
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react"

const VIEWPORT_ANIMATION_DURATION = 160

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.isContentEditable ||
      target.closest(
        'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]'
      )
  )
}

export function useKeyboardShortcuts<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  reactFlowInstance,
  undo,
  redo,
}: {
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType> | null
  undo: () => void
  redo: () => void
}) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return
      }

      const isModifierPressed = event.metaKey || event.ctrlKey

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()

        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }

        return
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
        return
      }

      if (!isModifierPressed && (event.key === "+" || event.key === "=")) {
        event.preventDefault()
        reactFlowInstance?.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION })
        return
      }

      if (!isModifierPressed && event.key === "-") {
        event.preventDefault()
        reactFlowInstance?.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION })
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [reactFlowInstance, redo, undo])
}
