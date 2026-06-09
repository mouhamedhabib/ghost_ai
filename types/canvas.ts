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
  textColor: string
  shape: CanvasNodeShape
}

export type CanvasNode = Node<CanvasNodeData, "canvas">
export type CanvasEdgeData = {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvas">

export type CanvasState = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}
