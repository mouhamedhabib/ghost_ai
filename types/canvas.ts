import type { Edge, Node } from "@xyflow/react"

export type CanvasNodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon"

export type CanvasNodeData = {
  label: string
  color: string
  shape: CanvasNodeShape
}

export type CanvasNode = Node<CanvasNodeData, "canvas">
export type CanvasEdge = Edge
