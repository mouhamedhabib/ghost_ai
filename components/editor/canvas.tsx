"use client"

import * as React from "react"
import {
  Background,
  BackgroundVariant,
  EdgeLabelRenderer,
  type EdgeProps,
  ConnectionMode,
  Handle,
  MarkerType,
  NodeResizer,
  NodeToolbar,
  type NodeProps,
  Position,
  ReactFlow,
  addEdge,
  getSmoothStepPath,
  type Connection,
  type ReactFlowInstance,
} from "@xyflow/react"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense"
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Maximize2,
  type LucideIcon,
  Pill,
  RectangleHorizontal,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import { Button } from "@/components/ui/button"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { cn } from "@/lib/utils"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

type EditorCanvasProps = {
  roomId: string
  onCanvasReady?: (importFn: (template: CanvasTemplate) => void) => void
}

type CanvasContextValue = {
  importTemplate: (template: CanvasTemplate) => void
}

const CanvasContext = React.createContext<CanvasContextValue | null>(null)

export function useCanvasImport() {
  const context = React.useContext(CanvasContext)
  if (!context) {
    throw new Error("useCanvasImport must be used within EditorCanvas")
  }
  return context
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

type ShapeDragPreviewState = ShapeDragPayload & {
  x: number
  y: number
}

type NodeColorPair = {
  id: string
  label: string
  background: string
  text: string
}

const SHAPE_DRAG_MIME_TYPE = "application/x-ghostai-shape"
const DEFAULT_NODE_COLOR = "rgb(24 24 27)"
const DEFAULT_NODE_TEXT_COLOR = "rgb(244 244 245)"
const DEFAULT_NODE_STROKE = "rgb(82 82 91)"
const SELECTED_NODE_STROKE = "rgb(244 244 245)"
const MIN_NODE_WIDTH = 80
const MIN_NODE_HEIGHT = 48
const VIEWPORT_ANIMATION_DURATION = 160
const DEFAULT_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: "rgb(212 212 216)",
  width: 18,
  height: 18,
}

function createCanvasNodeId(shape: CanvasNode["data"]["shape"]) {
  return `${shape}-${crypto.randomUUID()}`
}

const CanvasNodeActionsContext = React.createContext<{
  updateNodeLabel: (nodeId: string, label: string) => void
  updateNodeColors: (nodeId: string, colorPair: NodeColorPair) => void
} | null>(null)

const CanvasEdgeActionsContext = React.createContext<{
  updateEdgeLabel: (edgeId: string, label: string) => void
} | null>(null)

const NODE_COLOR_PALETTE: NodeColorPair[] = [
  {
    id: "graphite",
    label: "Graphite",
    background: DEFAULT_NODE_COLOR,
    text: DEFAULT_NODE_TEXT_COLOR,
  },
  {
    id: "blue",
    label: "Blue",
    background: "rgb(12 74 110)",
    text: "rgb(186 230 253)",
  },
  {
    id: "teal",
    label: "Teal",
    background: "rgb(19 78 74)",
    text: "rgb(153 246 228)",
  },
  {
    id: "amber",
    label: "Amber",
    background: "rgb(113 63 18)",
    text: "rgb(254 240 138)",
  },
  {
    id: "rose",
    label: "Rose",
    background: "rgb(136 19 55)",
    text: "rgb(251 207 232)",
  },
  {
    id: "violet",
    label: "Violet",
    background: "rgb(76 29 149)",
    text: "rgb(221 214 254)",
  },
]

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

function CanvasNodeRenderer({ id, data, selected, width, height }: NodeProps<CanvasNode>) {
  const shapeWidth = typeof width === "number" ? width : 160
  const shapeHeight = typeof height === "number" ? height : 88
  const nodeColor = data.color || DEFAULT_NODE_COLOR
  const nodeTextColor = data.textColor || DEFAULT_NODE_TEXT_COLOR

  return (
    <div
      className="ghostai-canvas-node relative"
      style={{
        width: shapeWidth,
        height: shapeHeight,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color={SELECTED_NODE_STROKE}
        lineClassName="ghostai-canvas-resize-line"
        handleClassName="ghostai-canvas-resize-handle"
      />
      <NodeColorToolbar
        nodeId={id}
        selected={selected}
        color={nodeColor}
        textColor={nodeTextColor}
      />
      <ShapeSurface
        shape={data.shape}
        color={nodeColor}
        selected={selected}
        width={shapeWidth}
        height={shapeHeight}
      />
      <NodeLabel nodeId={id} label={data.label} textColor={nodeTextColor} />
      <ConnectionHandles />
    </div>
  )
}

const nodeTypes = {
  canvas: CanvasNodeRenderer,
}

function CanvasEdgeRenderer({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const actions = React.useContext(CanvasEdgeActionsContext)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftLabel, setDraftLabel] = React.useState(data?.label ?? "")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const label = data?.label ?? ""
  const isActive = selected || isHovered || isEditing
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  })

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const stopCanvasInteraction = React.useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      event.stopPropagation()
    },
    []
  )

  const commitLabel = React.useCallback(
    (nextLabel: string) => {
      actions?.updateEdgeLabel(id, nextLabel.trim())
      setIsEditing(false)
    },
    [actions, id]
  )

  const handleDoubleClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setDraftLabel(label)
      setIsEditing(true)
    },
    [label]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation()

      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault()
        commitLabel(draftLabel)
      }
    },
    [commitLabel, draftLabel]
  )

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={22}
        className="react-flow__edge-interaction ghostai-canvas-edge-hitbox"
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        className={cn(
          "react-flow__edge-path ghostai-canvas-edge-path",
          isActive && "ghostai-canvas-edge-path-active"
        )}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel ghostai-canvas-edge-label"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onClick={stopCanvasInteraction}
          onDoubleClick={handleDoubleClick}
          onMouseDown={stopCanvasInteraction}
          onPointerDown={stopCanvasInteraction}
          onWheel={stopCanvasInteraction}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftLabel}
              aria-label="Edge label"
              className="ghostai-canvas-edge-label-input"
              size={Math.max(draftLabel.length, 4)}
              onChange={(event) => setDraftLabel(event.target.value)}
              onBlur={() => commitLabel(draftLabel)}
              onKeyDown={handleKeyDown}
              onClick={stopCanvasInteraction}
              onDoubleClick={stopCanvasInteraction}
              onMouseDown={stopCanvasInteraction}
              onPointerDown={stopCanvasInteraction}
            />
          ) : label ? (
            <button
              type="button"
              className="ghostai-canvas-edge-label-pill"
              onDoubleClick={handleDoubleClick}
            >
              {label}
            </button>
          ) : isActive ? (
            <button
              type="button"
              className="ghostai-canvas-edge-label-hint"
              onDoubleClick={handleDoubleClick}
            >
              Label
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const edgeTypes = {
  canvas: CanvasEdgeRenderer,
}

function ShapeSurface({
  shape,
  color,
  selected = false,
  width,
  height,
}: Pick<ShapeDragPayload, "shape" | "width" | "height"> & {
  color: string
  selected?: boolean
}) {
  const fill = color || DEFAULT_NODE_COLOR
  const stroke = selected ? SELECTED_NODE_STROKE : DEFAULT_NODE_STROKE

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
      <div
        className="absolute inset-0 rounded-full border bg-zinc-900"
        style={{
          backgroundColor: fill,
          borderColor: stroke,
        }}
      />
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
        "absolute inset-0 border bg-zinc-900",
        shape === "pill" ? "rounded-full" : "rounded-md"
      )}
      style={{
        backgroundColor: fill,
        borderColor: stroke,
      }}
    />
  )
}

function ConnectionHandles() {
  const handles = [
    { id: "top", position: Position.Top },
    { id: "right", position: Position.Right },
    { id: "bottom", position: Position.Bottom },
    { id: "left", position: Position.Left },
  ] as const

  return (
    <>
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          isConnectableStart
          isConnectableEnd
          className="ghostai-canvas-handle"
        />
      ))}
    </>
  )
}

function NodeColorToolbar({
  nodeId,
  selected,
  color,
  textColor,
}: {
  nodeId: string
  selected: boolean
  color: string
  textColor: string
}) {
  const actions = React.useContext(CanvasNodeActionsContext)

  const stopCanvasInteraction = React.useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      event.stopPropagation()
    },
    []
  )

  return (
    <NodeToolbar
      nodeId={nodeId}
      isVisible={selected}
      position={Position.Top}
      offset={14}
      className="nodrag nopan nowheel ghostai-node-color-toolbar"
      onClick={stopCanvasInteraction}
      onDoubleClick={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onPointerDown={stopCanvasInteraction}
      onWheel={stopCanvasInteraction}
    >
      {NODE_COLOR_PALETTE.map((colorPair) => {
        const isActive =
          colorPair.background === color && colorPair.text === textColor

        return (
          <button
            key={colorPair.id}
            type="button"
            className={cn(
              "ghostai-node-color-swatch",
              isActive && "ghostai-node-color-swatch-active"
            )}
            style={
              {
                "--ghostai-swatch-bg": colorPair.background,
                "--ghostai-swatch-text": colorPair.text,
              } as React.CSSProperties
            }
            aria-label={`${colorPair.label} node color`}
            aria-pressed={isActive}
            title={colorPair.label}
            onClick={(event) => {
              event.stopPropagation()
              actions?.updateNodeColors(nodeId, colorPair)
            }}
            onDoubleClick={stopCanvasInteraction}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
          />
        )
      })}
    </NodeToolbar>
  )
}

function NodeLabel({
  nodeId,
  label,
  textColor,
}: {
  nodeId: string
  label: string
  textColor: string
}) {
  const actions = React.useContext(CanvasNodeActionsContext)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftLabel, setDraftLabel] = React.useState(label)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [isEditing])

  const stopCanvasInteraction = React.useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      event.stopPropagation()
    },
    []
  )

  const handleDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setDraftLabel(label)
      setIsEditing(true)
    },
    [label]
  )

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextLabel = event.target.value

      setDraftLabel(nextLabel)
      actions?.updateNodeLabel(nodeId, nextLabel)
    },
    [actions, nodeId]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.stopPropagation()

      if (event.key === "Escape") {
        event.preventDefault()
        setIsEditing(false)
        textareaRef.current?.blur()
      }
    },
    []
  )

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={draftLabel}
        placeholder="Label"
        rows={2}
        className="nodrag nopan nowheel absolute inset-x-3 top-1/2 z-20 max-h-[70%] -translate-y-1/2 resize-none overflow-hidden border-0 bg-transparent px-1 text-center text-sm font-medium leading-snug text-zinc-100 outline-none placeholder:text-zinc-500"
        style={{ color: textColor }}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        onClick={stopCanvasInteraction}
        onDoubleClick={stopCanvasInteraction}
        onKeyDown={handleKeyDown}
        onMouseDown={stopCanvasInteraction}
        onPointerDown={stopCanvasInteraction}
        onWheel={stopCanvasInteraction}
      />
    )
  }

  return (
    <button
      type="button"
      className="nodrag nopan relative z-10 flex max-h-[70%] w-full items-center justify-center overflow-hidden bg-transparent px-4 text-center text-sm font-medium leading-snug text-zinc-100 outline-none"
      style={{ color: textColor }}
      onDoubleClick={handleDoubleClick}
      onClick={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onPointerDown={stopCanvasInteraction}
    >
      <span className={cn("line-clamp-3", !label && "text-zinc-500")}>
        {label || "Label"}
      </span>
    </button>
  )
}

function ShapeDragPreview({ preview }: { preview: ShapeDragPreviewState | null }) {
  if (!preview) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 opacity-70"
      style={{
        width: preview.width,
        height: preview.height,
        transform: `translate3d(${preview.x - preview.width / 2}px, ${preview.y - preview.height / 2}px, 0)`,
      }}
    >
      <ShapeSurface
        shape={preview.shape}
        color={DEFAULT_NODE_COLOR}
        selected
        width={preview.width}
        height={preview.height}
      />
    </div>
  )
}

function ShapeToolbar({
  onCreate,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  onCreate: (shape: ShapeDefinition) => void
  onDragStart: (preview: ShapeDragPreviewState) => void
  onDragMove: (position: Pick<ShapeDragPreviewState, "x" | "y">) => void
  onDragEnd: () => void
}) {
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

      const dragImage = document.createElement("canvas")
      dragImage.width = 1
      dragImage.height = 1
      event.dataTransfer.setDragImage(dragImage, 0, 0)

      onDragStart({
        ...payload,
        x: event.clientX,
        y: event.clientY,
      })
    },
    [onDragStart]
  )

  const handleDrag = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (event.clientX === 0 && event.clientY === 0) {
        return
      }

      onDragMove({
        x: event.clientX,
        y: event.clientY,
      })
    },
    [onDragMove]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, shape: ShapeDefinition) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onCreate(shape)
      }
    },
    [onCreate]
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
            onClick={() => onCreate(shape)}
            onKeyDown={(event) => handleKeyDown(event, shape)}
            onDragStart={(event) => handleDragStart(event, shape)}
            onDrag={handleDrag}
            onDragEnd={onDragEnd}
          >
            <Icon className="size-4" />
          </Button>
        )
      })}
    </div>
  )
}

function CanvasControlBar({
  reactFlowInstance,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  reactFlowInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}) {
  const stopCanvasInteraction = React.useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      event.stopPropagation()
    },
    []
  )

  const handleZoomOut = React.useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION })
  }, [reactFlowInstance])

  const handleFitView = React.useCallback(() => {
    reactFlowInstance?.fitView({
      duration: VIEWPORT_ANIMATION_DURATION,
      padding: 0.18,
    })
  }, [reactFlowInstance])

  const handleZoomIn = React.useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION })
  }, [reactFlowInstance])

  return (
    <div
      className="nodrag nopan nowheel pointer-events-auto absolute bottom-24 left-4 z-10 flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-2xl shadow-black/35 backdrop-blur"
      onClick={stopCanvasInteraction}
      onDoubleClick={stopCanvasInteraction}
      onMouseDown={stopCanvasInteraction}
      onPointerDown={stopCanvasInteraction}
      onWheel={stopCanvasInteraction}
    >
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          title="Zoom out"
          aria-label="Zoom out"
          onClick={handleZoomOut}
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          title="Fit view"
          aria-label="Fit view"
          onClick={handleFitView}
        >
          <Maximize2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          title="Zoom in"
          aria-label="Zoom in"
          onClick={handleZoomIn}
        >
          <ZoomIn className="size-4" />
        </Button>
      </div>
      <div className="mx-1 h-6 w-px bg-border" />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground disabled:opacity-35"
          title="Undo"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground disabled:opacity-35"
          title="Redo"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <Redo2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function FlowCanvas({ onCanvasReady }: { onCanvasReady?: (importFn: (template: CanvasTemplate) => void) => void }) {
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const [shapeDragPreview, setShapeDragPreview] =
    React.useState<ShapeDragPreviewState | null>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    })
  const renderedEdges = React.useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: "canvas" as const,
        markerEnd: edge.markerEnd ?? DEFAULT_EDGE_MARKER,
        data: {
          label: "",
          ...edge.data,
        },
      })),
    [edges]
  )
  const handleUndo = React.useCallback(() => {
    if (canUndo) {
      undo()
    }
  }, [canUndo, undo])
  const handleRedo = React.useCallback(() => {
    if (canRedo) {
      redo()
    }
  }, [canRedo, redo])

  const handleImportTemplate = React.useCallback(
    (template: CanvasTemplate) => {
      // Remove all existing nodes and edges
      const nodesToDelete = nodes.map((n) => ({ id: n.id }))
      const edgesToDelete = edges.map((e) => ({ id: e.id }))

      if (nodesToDelete.length > 0) {
        onNodesChange(
          nodesToDelete.map((node) => ({
            type: "remove" as const,
            id: node.id,
          }))
        )
      }

      if (edgesToDelete.length > 0) {
        onEdgesChange(
          edgesToDelete.map((edge) => ({
            type: "remove" as const,
            id: edge.id,
          }))
        )
      }

      // Add template nodes and edges
      onNodesChange(
        template.nodes.map((node) => ({
          type: "add" as const,
          item: node,
        }))
      )
      onEdgesChange(
        template.edges.map((edge) => ({
          type: "add" as const,
          item: edge,
        }))
      )

      // Fit view after import
      setTimeout(() => {
        reactFlowInstance?.fitView({
          duration: VIEWPORT_ANIMATION_DURATION,
          padding: 0.18,
        })
      }, 50)
    },
    [nodes, edges, onNodesChange, onEdgesChange, reactFlowInstance]
  )

  React.useEffect(() => {
    onCanvasReady?.(handleImportTemplate)
  }, [handleImportTemplate, onCanvasReady])

  useKeyboardShortcuts({
    reactFlowInstance,
    undo: handleUndo,
    redo: handleRedo,
  })

  const createNode = React.useCallback(
    (
      payload: ShapeDragPayload,
      screenPosition?: Pick<ShapeDragPreviewState, "x" | "y">
    ) => {
      if (!reactFlowInstance) {
        return
      }

      const canvasBounds = canvasRef.current?.getBoundingClientRect()
      const anchor = screenPosition ?? {
        x: canvasBounds ? canvasBounds.left + canvasBounds.width / 2 : window.innerWidth / 2,
        y: canvasBounds ? canvasBounds.top + canvasBounds.height / 2 : window.innerHeight / 2,
      }
      const position = reactFlowInstance.screenToFlowPosition(anchor)
      const nextNode: CanvasNode = {
        id: createCanvasNodeId(payload.shape),
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
          textColor: DEFAULT_NODE_TEXT_COLOR,
          shape: payload.shape,
        },
      }

      onNodesChange([{ type: "add", item: nextNode }])
    },
    [onNodesChange, reactFlowInstance]
  )

  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
      setShapeDragPreview((preview) =>
        preview
          ? {
            ...preview,
            x: event.clientX,
            y: event.clientY,
          }
          : preview
      )
    }
  }, [])

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const payload = readShapeDragPayload(event.dataTransfer)

      if (!payload) {
        return
      }

      event.preventDefault()
      setShapeDragPreview(null)
      createNode(payload, {
        x: event.clientX,
        y: event.clientY,
      })
    },
    [createNode]
  )

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      const nextEdges = addEdge<CanvasEdge>(
        {
          ...connection,
          type: "canvas",
          markerEnd: DEFAULT_EDGE_MARKER,
          data: {
            label: "",
          },
        },
        edges
      )
      const existingEdgeIds = new Set(edges.map((edge) => edge.id))
      const nextEdge = nextEdges.find((edge) => !existingEdgeIds.has(edge.id))

      if (!nextEdge) {
        return
      }

      onEdgesChange([{ type: "add", item: nextEdge }])
    },
    [edges, onEdgesChange]
  )

  const handleShapeDragStart = React.useCallback((preview: ShapeDragPreviewState) => {
    setShapeDragPreview(preview)
  }, [])

  const handleShapeDragMove = React.useCallback(
    (position: Pick<ShapeDragPreviewState, "x" | "y">) => {
      setShapeDragPreview((preview) =>
        preview
          ? {
            ...preview,
            ...position,
          }
          : preview
      )
    },
    []
  )

  const handleShapeDragEnd = React.useCallback(() => {
    setShapeDragPreview(null)
  }, [])

  const handleUpdateNodeData = React.useCallback(
    (nodeId: string, dataUpdate: Partial<CanvasNode["data"]>) => {
      const currentNode = reactFlowInstance?.getNode(nodeId) ?? nodes.find((node) => node.id === nodeId)

      if (!currentNode) {
        return
      }

      onNodesChange([
        {
          id: nodeId,
          type: "replace",
          item: {
            ...currentNode,
            data: {
              ...currentNode.data,
              ...dataUpdate,
            },
          },
        },
      ])
    },
    [nodes, onNodesChange, reactFlowInstance]
  )

  const handleUpdateNodeLabel = React.useCallback(
    (nodeId: string, label: string) => {
      handleUpdateNodeData(nodeId, { label })
    },
    [handleUpdateNodeData]
  )

  const handleUpdateNodeColors = React.useCallback(
    (nodeId: string, colorPair: NodeColorPair) => {
      handleUpdateNodeData(nodeId, {
        color: colorPair.background,
        textColor: colorPair.text,
      })
    },
    [handleUpdateNodeData]
  )

  const handleUpdateEdgeLabel = React.useCallback(
    (edgeId: string, label: string) => {
      const currentEdge =
        reactFlowInstance?.getEdge(edgeId) ?? edges.find((edge) => edge.id === edgeId)

      if (!currentEdge) {
        return
      }

      onEdgesChange([
        {
          id: edgeId,
          type: "replace",
          item: {
            ...currentEdge,
            type: "canvas",
            markerEnd: currentEdge.markerEnd ?? DEFAULT_EDGE_MARKER,
            data: {
              ...currentEdge.data,
              label,
            },
          },
        },
      ])
    },
    [edges, onEdgesChange, reactFlowInstance]
  )

  const nodeActions = React.useMemo(
    () => ({
      updateNodeLabel: handleUpdateNodeLabel,
      updateNodeColors: handleUpdateNodeColors,
    }),
    [handleUpdateNodeColors, handleUpdateNodeLabel]
  )
  const edgeActions = React.useMemo(
    () => ({
      updateEdgeLabel: handleUpdateEdgeLabel,
    }),
    [handleUpdateEdgeLabel]
  )

  return (
    <div ref={canvasRef} className="relative h-full bg-zinc-950">
      <CanvasNodeActionsContext.Provider value={nodeActions}>
        <CanvasEdgeActionsContext.Provider value={edgeActions}>
          <ReactFlow
            nodes={nodes}
            edges={renderedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
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
            <Cursors />
          </ReactFlow>
        </CanvasEdgeActionsContext.Provider>
      </CanvasNodeActionsContext.Provider>
      <CanvasControlBar
        reactFlowInstance={reactFlowInstance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <ShapeToolbar
        onCreate={(shape) =>
          createNode({
            shape: shape.shape,
            width: shape.width,
            height: shape.height,
          })
        }
        onDragStart={handleShapeDragStart}
        onDragMove={handleShapeDragMove}
        onDragEnd={handleShapeDragEnd}
      />
      <ShapeDragPreview preview={shapeDragPreview} />
    </div>
  )
}

export function EditorCanvas({ roomId, onCanvasReady }: EditorCanvasProps) {
  const canvasContextValue = React.useMemo(
    () => ({
      importTemplate: () => { },
    }),
    []
  )

  const handleCanvasReady = React.useCallback(
    (importFn: (template: CanvasTemplate) => void) => {
      onCanvasReady?.(importFn)
    },
    [onCanvasReady]
  )

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
            <CanvasContext.Provider value={canvasContextValue}>
              <FlowCanvas onCanvasReady={handleCanvasReady} />
            </CanvasContext.Provider>
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
