"use client"

import * as React from "react"
import {
  CanvasTemplate,
  CANVAS_TEMPLATES,
  calculateTemplateBounds,
} from "@/components/editor/starter-templates"
import {
  EditorDialog,
  EditorDialogContent,
  EditorDialogDescription,
  EditorDialogHeader,
  EditorDialogTitle,
} from "@/components/editor/editor-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DownloadIcon } from "lucide-react"

const PREVIEW_WIDTH = 720
const PREVIEW_HEIGHT = 405

type TemplatePreviewProps = {
  template: CanvasTemplate
}

function TemplatePreview({ template }: TemplatePreviewProps) {
  const bounds = calculateTemplateBounds(template)
  const boundsWidth = bounds.maxX - bounds.minX
  const boundsHeight = bounds.maxY - bounds.minY

  const scaleX = PREVIEW_WIDTH / boundsWidth
  const scaleY = PREVIEW_HEIGHT / boundsHeight
  const scale = Math.min(scaleX, scaleY) * 0.86

  const offsetX = (PREVIEW_WIDTH - boundsWidth * scale) / 2
  const offsetY = (PREVIEW_HEIGHT - boundsHeight * scale) / 2

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg border-b border-border bg-zinc-950"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Draw edges */}
        {template.edges.map((edge) => {
          const sourceNode = template.nodes.find((n) => n.id === edge.source)
          const targetNode = template.nodes.find((n) => n.id === edge.target)

          if (!sourceNode || !targetNode) return null

          const sourceX =
            offsetX +
            (sourceNode.position.x + (sourceNode.width ?? 160) / 2 - bounds.minX) * scale
          const sourceY =
            offsetY +
            (sourceNode.position.y + (sourceNode.height ?? 88) / 2 - bounds.minY) * scale
          const targetX =
            offsetX +
            (targetNode.position.x + (targetNode.width ?? 160) / 2 - bounds.minX) * scale
          const targetY =
            offsetY +
            (targetNode.position.y + (targetNode.height ?? 88) / 2 - bounds.minY) * scale

          return (
            <line
              key={edge.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="rgb(212 212 216)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.75"
            />
          )
        })}

        {/* Draw nodes */}
        {template.nodes.map((node) => {
          const x = offsetX + (node.position.x - bounds.minX) * scale
          const y = offsetY + (node.position.y - bounds.minY) * scale
          const w = (node.width ?? 160) * scale
          const h = (node.height ?? 88) * scale

          const shape = node.data.shape
          const fill = node.data.color
          const stroke = "rgb(82 82 91)"

          if (shape === "rectangle") {
            return (
              <rect
                key={node.id}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="4"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
            )
          }

          if (shape === "circle") {
            return (
              <circle
                key={node.id}
                cx={x + w / 2}
                cy={y + h / 2}
                r={Math.min(w, h) / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
            )
          }

          if (shape === "diamond") {
            const points = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`
            return (
              <polygon
                key={node.id}
                points={points}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
            )
          }

          if (shape === "pill") {
            return (
              <rect
                key={node.id}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={h / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
            )
          }

          if (shape === "hexagon") {
            const points = `${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`
            return (
              <polygon
                key={node.id}
                points={points}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
            )
          }

          if (shape === "cylinder") {
            const rimHeight = Math.min(h * 0.2, 6)
            return (
              <g key={node.id}>
                <path
                  d={`M${x} ${y + rimHeight / 2} C${x} ${y} ${x + w} ${y} ${x + w} ${y + rimHeight / 2} V${y + h - rimHeight / 2} C${x + w} ${y + h} ${x} ${y + h} ${x} ${y + h - rimHeight / 2} Z`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
                <ellipse
                  cx={x + w / 2}
                  cy={y + rimHeight / 2}
                  rx={Math.max(w / 2, 1)}
                  ry={Math.max(rimHeight / 2, 1)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2"
                />
              </g>
            )
          }

          return null
        })}
      </svg>
    </div>
  )
}

type StarterTemplatesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <EditorDialog open={open} onOpenChange={onOpenChange}>
      <EditorDialogContent className="max-h-[80vh] max-w-5xl gap-5 p-5">
        <EditorDialogHeader>
          <EditorDialogTitle className="text-xl">
            Import Template
          </EditorDialogTitle>
          <EditorDialogDescription>
            Choose a starter template to pre-populate your canvas.
          </EditorDialogDescription>
        </EditorDialogHeader>

        <ScrollArea className="max-h-[58vh] pr-1">
          <div className="grid grid-cols-1 gap-4 pb-1 md:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground"
              >
                <TemplatePreview template={template} />

                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="min-h-14 text-xs leading-5 text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      onImport(template)
                      onOpenChange(false)
                    }}
                    className="w-full gap-2"
                    size="sm"
                    variant="outline"
                  >
                    <DownloadIcon className="size-4" />
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </EditorDialogContent>
    </EditorDialog>
  )
}
