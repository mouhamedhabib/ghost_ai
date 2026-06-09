import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { logger, metadata, task } from "@trigger.dev/sdk";
import { put } from "@vercel/blob";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const GenerateSpecSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export type GenerateSpecPayload = z.infer<typeof GenerateSpecSchema>;

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

function buildSpecPrompt(chatHistory: GenerateSpecPayload["chatHistory"], nodes: GenerateSpecPayload["nodes"], edges: GenerateSpecPayload["edges"]): string {
  return `You are a technical spec writer. Generate a comprehensive technical specification in Markdown based on the following context.

## Canvas State

### Nodes (${nodes.length})
${JSON.stringify(nodes, null, 2)}

### Edges (${edges.length})
${JSON.stringify(edges, null, 2)}

## Chat History
${chatHistory.map((msg) => `**${msg.role}**: ${msg.content}`).join("\n")}

---

Generate a detailed technical specification covering:
1. **Overview** - High-level description of the system
2. **Architecture** - Key components and their interactions
3. **Data Model** - Core entities and relationships
4. **API Design** - Main endpoints and contracts
5. **User Flows** - Critical user journeys
6. **Implementation Notes** - Technical considerations and trade-offs

Format the output as valid Markdown.`;
}

export const generateSpec = task({
  id: "generate-spec",
  retry: {
    maxAttempts: 2,
    factor: 1.8,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 10_000,
    randomize: false,
  },
  run: async (payload: GenerateSpecPayload) => {
    const parsed = GenerateSpecSchema.safeParse(payload);

    if (!parsed.success) {
      logger.error("Invalid spec generation payload", {
        errors: parsed.error.issues,
      });
      throw new Error(`Invalid payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    }

    const { roomId, chatHistory, nodes, edges } = parsed.data;

    logger.info("Spec generation started", { roomId });

    metadata.set("status", "generating");

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const model = google("gemini-2.5-flash");
      const prompt = buildSpecPrompt(chatHistory, nodes, edges);

      const result = await model.doGenerate({
        prompt: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
        maxOutputTokens: 16_384,
        temperature: 0.3,
      });

      const specContent = result.content
        ?.filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
        .map((part) => part.text)
        .join("")
        .trim();

      if (!specContent) {
        logger.warn("Gemini did not return spec content", {
          finishReason: result.finishReason.unified,
        });
        throw new Error("No spec content generated");
      }

      const blob = await put(
        `projects/${roomId}/specs/${crypto.randomUUID()}.md`,
        specContent,
        {
          access: "private",
          contentType: "text/markdown",
          addRandomSuffix: false,
        }
      );

      await prisma.projectSpec.create({
        data: {
          projectId: roomId,
          filePath: blob.url,
        },
      });

      metadata.set("status", "complete");

      logger.info("Spec generation completed", {
        roomId,
        contentLength: specContent.length,
        filePath: blob.url,
      });

      return specContent;
    } catch (error) {
      const message = getErrorMessage(error);

      logger.error("Spec generation failed", {
        roomId,
        error: message,
      });

      metadata.set("status", "error");

      throw error;
    }
  },
});
