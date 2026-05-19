import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export type CanvasTemplate = {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

// Default node colors from the canvas
const NODE_COLORS = {
  graphite: { background: "rgb(24 24 27)", text: "rgb(244 244 245)" },
  blue: { background: "rgb(12 74 110)", text: "rgb(186 230 253)" },
  teal: { background: "rgb(19 78 74)", text: "rgb(153 246 228)" },
  amber: { background: "rgb(113 63 18)", text: "rgb(254 240 138)" },
  rose: { background: "rgb(136 19 55)", text: "rgb(251 207 232)" },
  violet: { background: "rgb(76 29 149)", text: "rgb(221 214 254)" },
}

function createNode(
  id: string,
  label: string,
  shape: CanvasNode["data"]["shape"],
  x: number,
  y: number,
  color: keyof typeof NODE_COLORS = "graphite",
  width: number = 160,
  height: number = 88
): CanvasNode {
  const colorData = NODE_COLORS[color]
  return {
    id,
    type: "canvas",
    position: { x, y },
    width,
    height,
    measured: { width, height },
    data: {
      label,
      shape,
      color: colorData.background,
      textColor: colorData.text,
    },
  }
}

function createEdge(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvas",
    data: {
      label: label ?? "",
    },
  }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "API Gateway routes traffic to isolated services, each backed by a dedicated database.",
    nodes: [
      createNode("api-gateway", "API Gateway", "rectangle", 150, 30, "blue", 160, 88),
      createNode("auth-service", "Auth Service", "rectangle", 30, 150, "violet", 160, 88),
      createNode("user-service", "User Service", "rectangle", 200, 150, "teal", 160, 88),
      createNode("product-service", "Product Service", "rectangle", 370, 150, "amber", 160, 88),
      createNode("order-service", "Order Service", "rectangle", 540, 150, "rose", 160, 88),
      createNode("database-auth", "Auth DB", "cylinder", 30, 280, "graphite", 120, 100),
      createNode("database-user", "User DB", "cylinder", 200, 280, "graphite", 120, 100),
      createNode("database-product", "Product DB", "cylinder", 370, 280, "graphite", 120, 100),
      createNode("database-order", "Order DB", "cylinder", 540, 280, "graphite", 120, 100),
    ],
    edges: [
      createEdge("edge-1", "api-gateway", "auth-service"),
      createEdge("edge-2", "api-gateway", "user-service"),
      createEdge("edge-3", "api-gateway", "product-service"),
      createEdge("edge-4", "api-gateway", "order-service"),
      createEdge("edge-5", "auth-service", "database-auth"),
      createEdge("edge-6", "user-service", "database-user"),
      createEdge("edge-7", "product-service", "database-product"),
      createEdge("edge-8", "order-service", "database-order"),
      createEdge("edge-9", "order-service", "product-service"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "End-to-end delivery from source commit through build, test, and staged deployment.",
    nodes: [
      createNode("code-push", "Code Push", "diamond", 30, 100, "blue", 140, 88),
      createNode("git-trigger", "Git Webhook", "rectangle", 220, 100, "teal", 160, 88),
      createNode("build", "Build", "rectangle", 410, 100, "amber", 160, 88),
      createNode("test", "Run Tests", "rectangle", 600, 100, "violet", 160, 88),
      createNode("scan", "Security Scan", "hexagon", 780, 100, "rose", 140, 88),
      createNode("staging", "Deploy to Staging", "rectangle", 410, 250, "teal", 160, 88),
      createNode("approval", "Manual Approval", "diamond", 600, 250, "amber", 140, 88),
      createNode("production", "Deploy to Production", "rectangle", 780, 250, "rose", 160, 88),
      createNode("notification", "Notify Team", "pill", 950, 250, "graphite", 140, 88),
    ],
    edges: [
      createEdge("cicd-1", "code-push", "git-trigger"),
      createEdge("cicd-2", "git-trigger", "build"),
      createEdge("cicd-3", "build", "test"),
      createEdge("cicd-4", "test", "scan"),
      createEdge("cicd-5", "scan", "staging"),
      createEdge("cicd-6", "staging", "approval"),
      createEdge("cicd-7", "approval", "production"),
      createEdge("cicd-8", "production", "notification"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publish events to a central bus for consumers, analytics, and data stores.",
    nodes: [
      createNode("producer-1", "Event Producer", "rectangle", 50, 80, "blue", 160, 88),
      createNode("producer-2", "Event Producer", "rectangle", 50, 200, "blue", 160, 88),
      createNode("event-bus", "Event Bus", "rectangle", 280, 140, "amber", 160, 88),
      createNode("consumer-1", "Consumer 1", "rectangle", 510, 40, "teal", 160, 88),
      createNode("consumer-2", "Consumer 2", "rectangle", 510, 120, "violet", 160, 88),
      createNode("consumer-3", "Consumer 3", "rectangle", 510, 200, "rose", 160, 88),
      createNode("db-1", "Data Store 1", "cylinder", 510, 300, "graphite", 120, 100),
      createNode("db-2", "Data Store 2", "cylinder", 680, 300, "graphite", 120, 100),
      createNode("db-3", "Data Store 3", "cylinder", 850, 300, "graphite", 120, 100),
      createNode("analytics", "Analytics Engine", "diamond", 680, 80, "amber", 140, 88),
    ],
    edges: [
      createEdge("ed-1", "producer-1", "event-bus"),
      createEdge("ed-2", "producer-2", "event-bus"),
      createEdge("ed-3", "event-bus", "consumer-1"),
      createEdge("ed-4", "event-bus", "consumer-2"),
      createEdge("ed-5", "event-bus", "consumer-3"),
      createEdge("ed-6", "event-bus", "analytics"),
      createEdge("ed-7", "consumer-1", "db-1"),
      createEdge("ed-8", "consumer-2", "db-2"),
      createEdge("ed-9", "consumer-3", "db-3"),
      createEdge("ed-10", "analytics", "db-2"),
    ],
  },
]

export function calculateTemplateBounds(template: CanvasTemplate) {
  if (template.nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 500, maxY: 500 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  template.nodes.forEach((node) => {
    const nodeWidth = node.width ?? node.measured?.width ?? 160
    const nodeHeight = node.height ?? node.measured?.height ?? 88

    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + nodeWidth)
    maxY = Math.max(maxY, node.position.y + nodeHeight)
  })

  // Add padding
  const padding = 40
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  }
}
