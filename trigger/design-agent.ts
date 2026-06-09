import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type {
  LanguageModelV3Content,
  LanguageModelV3Prompt,
} from "@ai-sdk/provider";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { logger, task } from "@trigger.dev/sdk";
import type { JSONSchema7 } from "json-schema";

import { getLiveblocksClient } from "@/lib/liveblocks";
import type {
  CanvasEdge,
  CanvasNode,
  CanvasNodeShape,
  CanvasState,
} from "@/types/canvas";

export type DesignAgentPayload = {
  prompt: string;
  roomId: string;
};

type DesignAction =
  | {
    type: "addNode";
    id?: string;
    label: string;
    shape?: CanvasNodeShape;
    color?: string;
    textColor?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }
  | {
    type: "moveNode";
    id: string;
    x: number;
    y: number;
  }
  | {
    type: "resizeNode";
    id: string;
    width: number;
    height: number;
  }
  | {
    type: "updateNodeData";
    id: string;
    label?: string;
    shape?: CanvasNodeShape;
    color?: string;
    textColor?: string;
  }
  | {
    type: "deleteNode";
    id: string;
  }
  | {
    type: "addEdge";
    id?: string;
    source: string;
    target: string;
    label?: string;
  }
  | {
    type: "deleteEdge";
    id: string;
  };

type DesignPlan = {
  summary: string;
  actions: DesignAction[];
};

type StatusKind = "started" | "processing" | "complete" | "error";

const AI_USER_ID = "ghost-ai-design-agent";
const AI_USER_INFO = {
  name: "Ghost AI",
  avatar: "",
  color: "#8b5cf6",
};

const ALLOWED_SHAPES: CanvasNodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
];

const NODE_PALETTE = [
  { color: "rgb(24 24 27)", textColor: "rgb(244 244 245)" },
  { color: "rgb(12 74 110)", textColor: "rgb(186 230 253)" },
  { color: "rgb(19 78 74)", textColor: "rgb(153 246 228)" },
  { color: "rgb(113 63 18)", textColor: "rgb(254 240 138)" },
  { color: "rgb(136 19 55)", textColor: "rgb(251 207 232)" },
  { color: "rgb(76 29 149)", textColor: "rgb(221 214 254)" },
] as const;

const DEFAULT_NODE_SIZE: Record<CanvasNodeShape, { width: number; height: number }> = {
  rectangle: { width: 160, height: 88 },
  diamond: { width: 152, height: 120 },
  circle: { width: 112, height: 112 },
  pill: { width: 156, height: 72 },
  cylinder: { width: 136, height: 104 },
  hexagon: { width: 148, height: 96 },
};

const MIN_NODE_WIDTH = 80;
const MIN_NODE_HEIGHT = 48;
const GRID_GAP_X = 230;
const GRID_GAP_Y = 150;
const MAX_AI_NODES = 12;
const STATUS_PRESENCE_TTL_SECONDS = 60;

const designPlanSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "actions"],
  properties: {
    summary: { type: "string" },
    actions: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type"],
        properties: {
          type: {
            type: "string",
            enum: [
              "addNode",
              "moveNode",
              "resizeNode",
              "updateNodeData",
              "deleteNode",
              "addEdge",
              "deleteEdge",
            ],
          },
          id: { type: "string" },
          label: { type: "string" },
          shape: { type: "string", enum: ALLOWED_SHAPES },
          color: { type: "string" },
          textColor: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          source: { type: "string" },
          target: { type: "string" },
        },
      },
    },
  },
};

function getErrorMessage(error: unknown) {
  const parts: string[] = [];

  if (error instanceof Error && error.message) {
    parts.push(error.message);
  }

  if (error && typeof error === "object") {
    const details = [
      "status",
      "statusCode",
      "code",
      "details",
      "body",
    ].flatMap((key) => {
      const value = (error as Record<string, unknown>)[key];
      return value === undefined ? [] : [`${key}: ${String(value)}`];
    });

    if (details.length > 0) {
      parts.push(...details);
    }
  }

  return parts.length > 0 ? parts.join(", ") : String(error);
}

function extractText(content: LanguageModelV3Content[]) {
  return content
    .filter((part): part is Extract<LanguageModelV3Content, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

function normalizeDesignPlan(value: unknown): DesignPlan {
  const parsed = value as Partial<DesignPlan>;

  if (!parsed || typeof parsed.summary !== "string" || !Array.isArray(parsed.actions)) {
    throw new Error("Gemini returned an invalid design plan");
  }

  return {
    summary: parsed.summary,
    actions: parsed.actions.filter(isDesignAction),
  };
}

function parseDesignPlan(text: string): DesignPlan {
  const unfenced = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini returned an incomplete design plan");
  }

  return normalizeDesignPlan(JSON.parse(unfenced.slice(start, end + 1)));
}

function createFallbackDesignPlan(prompt: string, canvas: CanvasState): DesignPlan {
  if (canvas.nodes.length > 0) {
    return {
      summary: "Added a compact SaaS architecture expansion from a fallback plan.",
      actions: [
        {
          type: "addNode",
          id: "ai-billing",
          label: "Billing and subscriptions",
          shape: "rectangle",
          x: 520,
          y: 80,
        },
        {
          type: "addNode",
          id: "ai-analytics",
          label: "Product analytics",
          shape: "rectangle",
          x: 520,
          y: 240,
        },
      ],
    };
  }

  const summary =
    prompt.trim().length > 0
      ? `Created a SaaS product canvas for: ${prompt.trim().slice(0, 90)}`
      : "Created a SaaS product canvas from a fallback plan.";

  return {
    summary,
    actions: [
      {
        type: "addNode",
        id: "ai-landing",
        label: "Marketing site",
        shape: "rectangle",
        x: 80,
        y: 80,
      },
      {
        type: "addNode",
        id: "ai-auth",
        label: "Auth and onboarding",
        shape: "pill",
        x: 320,
        y: 80,
      },
      {
        type: "addNode",
        id: "ai-dashboard",
        label: "Customer dashboard",
        shape: "rectangle",
        x: 560,
        y: 80,
      },
      {
        type: "addNode",
        id: "ai-billing",
        label: "Billing and plans",
        shape: "cylinder",
        x: 800,
        y: 80,
      },
      {
        type: "addNode",
        id: "ai-data",
        label: "App database",
        shape: "cylinder",
        x: 560,
        y: 250,
      },
      {
        type: "addNode",
        id: "ai-notifications",
        label: "Email notifications",
        shape: "rectangle",
        x: 800,
        y: 250,
      },
      {
        type: "addNode",
        id: "ai-analytics",
        label: "Usage analytics",
        shape: "hexagon",
        x: 1040,
        y: 160,
      },
      { type: "addEdge", source: "ai-landing", target: "ai-auth", label: "signup" },
      { type: "addEdge", source: "ai-auth", target: "ai-dashboard", label: "session" },
      { type: "addEdge", source: "ai-dashboard", target: "ai-billing", label: "upgrade" },
      { type: "addEdge", source: "ai-dashboard", target: "ai-data", label: "read/write" },
      { type: "addEdge", source: "ai-billing", target: "ai-notifications", label: "receipt" },
      { type: "addEdge", source: "ai-dashboard", target: "ai-analytics", label: "events" },
    ],
  };
}

function isDesignAction(value: unknown): value is DesignAction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const action = value as Record<string, unknown>;

  if (action.type === "addNode") {
    return typeof action.label === "string";
  }

  if (action.type === "moveNode") {
    return (
      typeof action.id === "string" &&
      typeof action.x === "number" &&
      typeof action.y === "number"
    );
  }

  if (action.type === "resizeNode") {
    return (
      typeof action.id === "string" &&
      typeof action.width === "number" &&
      typeof action.height === "number"
    );
  }

  if (action.type === "updateNodeData" || action.type === "deleteNode" || action.type === "deleteEdge") {
    return typeof action.id === "string";
  }

  if (action.type === "addEdge") {
    return typeof action.source === "string" && typeof action.target === "string";
  }

  return false;
}

function sanitizeId(value: string, fallback: string) {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return sanitized || fallback;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback;
}

function normalizeShape(shape: unknown): CanvasNodeShape {
  return ALLOWED_SHAPES.includes(shape as CanvasNodeShape)
    ? (shape as CanvasNodeShape)
    : "rectangle";
}

function normalizePalette(color: unknown, textColor: unknown, index: number) {
  const paletteEntry = NODE_PALETTE[index % NODE_PALETTE.length];
  const matchingEntry = NODE_PALETTE.find(
    (entry) => entry.color === color || entry.textColor === textColor
  );

  return matchingEntry ?? paletteEntry;
}

function createNodeFromAction(
  action: Extract<DesignAction, { type: "addNode" }>,
  index: number,
  existingIds: Set<string>
): CanvasNode {
  const shape = normalizeShape(action.shape);
  const size = DEFAULT_NODE_SIZE[shape];
  const baseId = sanitizeId(action.id ?? action.label, `ai-node-${index + 1}`);
  let id = baseId;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  existingIds.add(id);

  const palette = normalizePalette(action.color, action.textColor, index);
  const row = Math.floor(index / 3);
  const column = index % 3;
  const width = clampNumber(action.width, size.width, MIN_NODE_WIDTH, 280);
  const height = clampNumber(action.height, size.height, MIN_NODE_HEIGHT, 200);

  return {
    id,
    type: "canvas",
    position: {
      x: clampNumber(action.x, column * GRID_GAP_X, -2000, 4000),
      y: clampNumber(action.y, row * GRID_GAP_Y, -2000, 4000),
    },
    width,
    height,
    measured: { width, height },
    data: {
      label: action.label.trim().slice(0, 80) || "Untitled",
      color: palette.color,
      textColor: palette.textColor,
      shape,
    },
  };
}

function createEdgeFromAction(
  action: Extract<DesignAction, { type: "addEdge" }>,
  index: number,
  existingIds: Set<string>
): CanvasEdge {
  const baseId = sanitizeId(
    action.id ?? `edge-${action.source}-${action.target}`,
    `ai-edge-${index + 1}`
  );
  let id = baseId;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  existingIds.add(id);

  return {
    id,
    source: action.source,
    target: action.target,
    type: "canvas",
    data: {
      label: action.label?.trim().slice(0, 60) ?? "",
    },
  };
}

function summarizeCanvas(canvas: CanvasState) {
  return {
    nodes: canvas.nodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      shape: node.data.shape,
      position: node.position,
      width: node.width,
      height: node.height,
    })),
    edges: canvas.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.data?.label ?? "",
    })),
  };
}

async function readCanvas(roomId: string): Promise<CanvasState> {
  let canvas: CanvasState = { nodes: [], edges: [] };

  await mutateFlow<CanvasNode, CanvasEdge>(
    { client: getLiveblocksClient(), roomId },
    (flow) => {
      canvas = {
        nodes: [...flow.nodes],
        edges: [...flow.edges],
      };
    }
  );

  return canvas;
}

async function ensureLiveblocksRoom(roomId: string) {
  try {
    await getLiveblocksClient().getOrCreateRoom(roomId, {
      defaultAccesses: [],
      metadata: {
        projectId: roomId,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("Unable to prepare Liveblocks room", {
      roomId,
      error: message,
    });

    throw new Error(
      `Liveblocks room "${roomId}" could not be prepared. ${message}`
    );
  }
}

async function publishStatus(roomId: string, kind: StatusKind, message: string) {
  try {
    await getLiveblocksClient().broadcastEvent(roomId, {
      type: "ai-status",
      id: `${Date.now()}-${kind}`,
      kind,
      message,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn("Unable to publish AI status", {
      roomId,
      kind,
      error: getErrorMessage(error),
    });
  }
}

async function updateAiPresence(
  roomId: string,
  cursor: { x: number; y: number } | null,
  thinking: boolean,
  ttl = STATUS_PRESENCE_TTL_SECONDS
) {
  try {
    await getLiveblocksClient().setPresence(roomId, {
      userId: AI_USER_ID,
      userInfo: AI_USER_INFO,
      data: { cursor, thinking },
      ttl,
    });
  } catch (error) {
    logger.warn("Unable to update AI presence", {
      roomId,
      error: getErrorMessage(error),
    });
  }
}

async function interpretPromptWithGemini(prompt: string, canvas: CanvasState) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const model = google("gemini-2.5-flash");
  const modelPrompt: LanguageModelV3Prompt = [
    {
      role: "system",
      content: [
        "You are Ghost AI, a collaborative systems design agent.",
        "Return only compact JSON matching the schema.",
        "Use existing node and edge IDs when modifying or deleting.",
        `Allowed shapes: ${ALLOWED_SHAPES.join(", ")}.`,
        `Allowed colors: ${NODE_PALETTE.map((entry) => `${entry.color} with ${entry.textColor}`).join("; ")}.`,
        "Keep layout readable: left-to-right or top-to-bottom, at least 190px horizontal spacing and 120px vertical spacing.",
        `Create no more than ${MAX_AI_NODES} new nodes.`,
      ].join(" "),
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            prompt,
            currentCanvas: summarizeCanvas(canvas),
          }),
        },
      ],
    },
  ];

  const result = await model.doGenerate({
    prompt: modelPrompt,
    maxOutputTokens: 8_000,
    temperature: 0.25,
    responseFormat: {
      type: "json",
      schema: designPlanSchema,
      name: "design_plan",
      description: "Canvas mutation actions for the Ghost AI collaborative design canvas.",
    },
  });
  const text = extractText(result.content);

  if (!text) {
    logger.warn("Gemini did not return a design plan, using fallback", {
      finishReason: result.finishReason.unified,
      rawFinishReason: result.finishReason.raw,
      contentTypes: result.content.map((part) => part.type),
    });
    return createFallbackDesignPlan(prompt, canvas);
  }

  try {
    return parseDesignPlan(text);
  } catch (error) {
    logger.warn("Gemini returned an invalid design plan, using fallback", {
      error: getErrorMessage(error),
      finishReason: result.finishReason.unified,
      rawFinishReason: result.finishReason.raw,
    });
    return createFallbackDesignPlan(prompt, canvas);
  }
}

async function applyDesignPlan(roomId: string, plan: DesignPlan) {
  let appliedActions = 0;

  await mutateFlow<CanvasNode, CanvasEdge>(
    { client: getLiveblocksClient(), roomId },
    (flow) => {
      const nodeIds = new Set(flow.nodes.map((node) => node.id));
      const edgeIds = new Set(flow.edges.map((edge) => edge.id));
      let addNodeCount = 0;
      let addEdgeCount = 0;

      for (const action of plan.actions) {
        if (action.type === "addNode" && addNodeCount < MAX_AI_NODES) {
          flow.addNode(createNodeFromAction(action, addNodeCount, nodeIds));
          addNodeCount += 1;
          appliedActions += 1;
          continue;
        }

        if (action.type === "moveNode" && nodeIds.has(action.id)) {
          flow.updateNode(action.id, {
            position: {
              x: clampNumber(action.x, 0, -2000, 4000),
              y: clampNumber(action.y, 0, -2000, 4000),
            },
          });
          appliedActions += 1;
          continue;
        }

        if (action.type === "resizeNode" && nodeIds.has(action.id)) {
          const width = clampNumber(action.width, DEFAULT_NODE_SIZE.rectangle.width, MIN_NODE_WIDTH, 280);
          const height = clampNumber(action.height, DEFAULT_NODE_SIZE.rectangle.height, MIN_NODE_HEIGHT, 200);

          flow.updateNode(action.id, {
            width,
            height,
            measured: { width, height },
          });
          appliedActions += 1;
          continue;
        }

        if (action.type === "updateNodeData" && nodeIds.has(action.id)) {
          const existingNode = flow.getNode(action.id);
          const palette = normalizePalette(action.color, action.textColor, 0);

          flow.updateNodeData(action.id, {
            label: action.label?.trim().slice(0, 80) ?? existingNode?.data.label ?? "",
            shape: action.shape ? normalizeShape(action.shape) : existingNode?.data.shape ?? "rectangle",
            color: action.color ? palette.color : existingNode?.data.color ?? palette.color,
            textColor: action.textColor ? palette.textColor : existingNode?.data.textColor ?? palette.textColor,
          });
          appliedActions += 1;
          continue;
        }

        if (action.type === "deleteNode" && nodeIds.has(action.id)) {
          const connectedEdges = flow.edges
            .filter((edge) => edge.source === action.id || edge.target === action.id)
            .map((edge) => edge.id);

          flow.removeEdges(connectedEdges);
          flow.removeNode(action.id);
          nodeIds.delete(action.id);
          for (const edgeId of connectedEdges) {
            edgeIds.delete(edgeId);
          }
          appliedActions += 1;
          continue;
        }

        if (
          action.type === "addEdge" &&
          nodeIds.has(action.source) &&
          nodeIds.has(action.target) &&
          action.source !== action.target
        ) {
          flow.addEdge(createEdgeFromAction(action, addEdgeCount, edgeIds));
          addEdgeCount += 1;
          appliedActions += 1;
          continue;
        }

        if (action.type === "deleteEdge" && edgeIds.has(action.id)) {
          flow.removeEdge(action.id);
          edgeIds.delete(action.id);
          appliedActions += 1;
        }
      }
    }
  );

  return appliedActions;
}

export const designAgentTask = task({
  id: "design-agent",
  retry: {
    maxAttempts: 2,
    factor: 1.8,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 10_000,
    randomize: false,
  },
  run: async (payload: DesignAgentPayload) => {
    logger.info("Design agent started", {
      roomId: payload.roomId,
      prompt: payload.prompt,
    });

    await ensureLiveblocksRoom(payload.roomId);
    await updateAiPresence(payload.roomId, { x: 80, y: 80 }, true);
    await publishStatus(payload.roomId, "started", "Ghost AI is reading your prompt.");

    try {
      const canvas = await readCanvas(payload.roomId);

      await updateAiPresence(payload.roomId, { x: 180, y: 120 }, true);
      await publishStatus(payload.roomId, "processing", "Ghost AI is planning canvas updates.");

      const plan = await interpretPromptWithGemini(payload.prompt, canvas);

      await updateAiPresence(payload.roomId, { x: 280, y: 180 }, true);
      await publishStatus(payload.roomId, "processing", "Ghost AI is applying the design to the canvas.");

      const appliedActions = await applyDesignPlan(payload.roomId, plan);

      await publishStatus(
        payload.roomId,
        "complete",
        appliedActions > 0
          ? `Ghost AI updated the canvas: ${plan.summary}`
          : "Ghost AI finished but did not find any safe canvas updates to apply."
      );
      logger.info("Design agent completed", {
        roomId: payload.roomId,
        appliedActions,
      });

      return {
        roomId: payload.roomId,
        summary: plan.summary,
        appliedActions,
      };
    } catch (error) {
      const message = getErrorMessage(error);

      logger.error("Design agent failed", {
        roomId: payload.roomId,
        error: message,
      });
      await publishStatus(payload.roomId, "error", `Ghost AI could not update the canvas: ${message}`);
      throw error;
    } finally {
      await updateAiPresence(payload.roomId, null, false, 2);
    }
  },
});
