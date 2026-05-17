"use client"

import * as React from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  MiniMap,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense"
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  type LucideIcon,
  Pill,
  RectangleHorizontal,
} from "lucide-react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EditorCanvasProps = {
  roomId: string
}

type CanvasErrorBoundaryProps = {
  children: React.ReactNode
  fallback: React.ReactNode
}

type CanvasErrorBoundaryState = {
  hasError: boolean
}

type ShapeDefinition = {
  shape: CanvasNode["data"]["shape"]
  label: string
  width: number
  height: number
  icon: LucideIcon
}

type ShapeDragPayload = {
  shape: CanvasNode["data"]["shape"]
  width: number
  height: number
}

const SHAPE_DRAG_MIME_TYPE = "application/x-ghostai-shape"
const DEFAULT_NODE_COLOR = "rgb(24 24 27)"
const DEFAULT_NODE_STROKE = "rgb(63 63 70)"

const SHAPES: ShapeDefinition[] = [
  {
    shape: "rectangle",
    label: "Rectangle",
    width: 160,
    height: 88,
    icon: RectangleHorizontal,
  },
  {
    shape: "diamond",
    label: "Diamond",
    width: 152,
    height: 120,
    icon: Diamond,
  },
  {
    shape: "circle",
    label: "Circle",
    width: 112,
    height: 112,
    icon: Circle,
  },
  {
    shape: "pill",
    label: "Pill",
    width: 156,
    height: 72,
    icon: Pill,
  },
  {
    shape: "cylinder",
    label: "Cylinder",
    width: 136,
    height: 104,
    icon: Cylinder,
  },
  {
    shape: "hexagon",
    label: "Hexagon",
    width: 148,
    height: 96,
    icon: Hexagon,
  },
]

class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

function CanvasFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-zinc-950 text-sm text-zinc-400">
      {message}
    </div>
  )
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const payload = value as Partial<ShapeDragPayload>

  return (
    SHAPES.some((shape) => shape.shape === payload.shape) &&
    typeof payload.width === "number" &&
    Number.isFinite(payload.width) &&
    typeof payload.height === "number" &&
    Number.isFinite(payload.height)
  )
}

function readShapeDragPayload(dataTransfer: DataTransfer): ShapeDragPayload | null {
  const rawPayload = dataTransfer.getData(SHAPE_DRAG_MIME_TYPE)

  if (!rawPayload) {
    return null
  }

  try {
    const payload = JSON.parse(rawPayload) as unknown

    return isShapeDragPayload(payload) ? payload : null
  } catch {
    return null
  }
}

function CanvasNodeRenderer({ data, width, height }: NodeProps<CanvasNode>) {
  const shapeWidth = typeof width === "number" ? width : 160
  const shapeHeight = typeof height === "number" ? height : 88

  return (
    <div
      className="ghostai-canvas-node nodrag relative"
      style={{
        width: shapeWidth,
        height: shapeHeight,
      }}
    >
      <ShapeSurface
        shape={data.shape}
        color={data.color}
        width={shapeWidth}
        height={shapeHeight}
      />
      <span className="pointer-events-none relative z-10 px-4 text-center text-sm font-medium text-zinc-100">
        {data.label}
      </span>
      <ConnectionHandles />
    </div>
  )
}

const nodeTypes = {
  canvas: CanvasNodeRenderer,
}

function ShapeSurface({
  shape,
  color,
  width,
  height,
}: Pick<ShapeDragPayload, "shape" | "width" | "height"> & {
  color: string
}) {
  const fill = color || DEFAULT_NODE_COLOR
  const stroke = DEFAULT_NODE_STROKE

  if (shape === "diamond") {
    return (
      <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={`${width / 2},1 ${width - 1},${height / 2} ${width / 2},${height - 1} 1,${height / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "circle") {
    return (
      <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={Math.max(width / 2 - 1, 1)}
          ry={Math.max(height / 2 - 1, 1)}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "cylinder") {
    const rimHeight = Math.min(24, height * 0.24)

    return (
      <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M1 ${rimHeight / 2} C1 1 ${width - 1} 1 ${width - 1} ${rimHeight / 2} V${height - rimHeight / 2} C${width - 1} ${height - 1} 1 ${height - 1} 1 ${height - rimHeight / 2} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx={width / 2}
          cy={rimHeight / 2}
          rx={Math.max(width / 2 - 1, 1)}
          ry={Math.max(rimHeight / 2 - 1, 1)}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "hexagon") {
    return (
      <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={`${width * 0.25},1 ${width * 0.75},1 ${width - 1},${height / 2} ${width * 0.75},${height - 1} ${width * 0.25},${height - 1} 1,${height / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <div
      className={cn(
        "absolute inset-0 border border-zinc-700 bg-zinc-900",
        shape === "pill" ? "rounded-full" : "rounded-md"
      )}
      style={{ backgroundColor: fill }}
    />
  )
}

function ConnectionHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className="ghostai-canvas-handle" />
      <Handle type="source" position={Position.Right} className="ghostai-canvas-handle" />
      <Handle type="target" position={Position.Bottom} className="ghostai-canvas-handle" />
      <Handle type="source" position={Position.Left} className="ghostai-canvas-handle" />
    </>
  )
}

function ShapeToolbar() {
  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>, shape: ShapeDefinition) => {
      const payload: ShapeDragPayload = {
        shape: shape.shape,
        width: shape.width,
        height: shape.height,
      }

      event.dataTransfer.effectAllowed = "copy"
      event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload))
      event.dataTransfer.setData("text/plain", shape.shape)
    },
    []
  )

  return (
    <div className="pointer-events-auto absolute bottom-15 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-2xl shadow-black/35 backdrop-blur">
      {SHAPES.map((shape) => {
        const Icon = shape.icon

        return (
          <Button
            key={shape.shape}
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            draggable={true}
            data-node-shape={shape.shape}
            title={shape.label}
            aria-label={shape.label}
            onDragStart={(event) => handleDragStart(event, shape)}
          >
            <Icon className="size-4" />
          </Button>
        )
      })}
    </div>
  )
}

function FlowCanvas() {
  const nodeCounterRef = React.useRef(0)
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    })

  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
    }
  }, [])

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const payload = readShapeDragPayload(event.dataTransfer)

      if (!payload || !reactFlowInstance) {
        return
      }

      event.preventDefault()

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const counter = nodeCounterRef.current + 1
      const nextNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${counter}`,
        type: "canvas",
        position: {
          x: position.x - payload.width / 2,
          y: position.y - payload.height / 2,
        },
        width: payload.width,
        height: payload.height,
        measured: {
          width: payload.width,
          height: payload.height,
        },
        data: {
          label: SHAPES.find((shape) => shape.shape === payload.shape)?.label ?? "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      }

      nodeCounterRef.current = counter
      onNodesChange([{ type: "add", item: nextNode }])
    },
    [onNodesChange, reactFlowInstance]
  )

  return (
    <div className="relative h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="ghostai-design-canvas"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(244, 244, 245, 0.14)"
        />
        <MiniMap
          pannable
          zoomable
          className="ghostai-canvas-minimap"
          nodeColor="#d4d4d8"
          maskColor="rgba(9, 9, 11, 0.64)"
          bgColor="#111113"
        />
        <Cursors />
      </ReactFlow>
      <ShapeToolbar />
    </div>
  )
}

export function EditorCanvas({ roomId }: EditorCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
      >
        <CanvasErrorBoundary
          fallback={<CanvasFallback message="Unable to connect to the canvas." />}
        >
          <ClientSideSuspense
            fallback={<CanvasFallback message="Loading canvas..." />}
          >
            <FlowCanvas />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
