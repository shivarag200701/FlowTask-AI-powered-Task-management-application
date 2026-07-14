import { Router } from "express";
import { requireLogin } from "../../../middleware/requireLogin.js";
import { StartConversationSchema, SendMessageSchema } from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";
import openRouter from "../../../services/ai/OpenRouterService.js";
import { buildAssistantChatPrompt } from "../../../services/ai/prompts/assistant.js";
import { TASK_TOOLS } from "../../../services/ai/tools/tasks/definitions.js";

const assistantRouter = Router();

// Create a new conversation
assistantRouter.post("/conversations", requireLogin, async (req, res) => {
  const userId = req.userId;
  const { success, data, error } = StartConversationSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ msg: "Invalid request data", error });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const now = new Date();
    const systemPrompt = buildAssistantChatPrompt({
      today: now.toLocaleDateString("en-CA", { timeZone: data.timezone }),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long", timeZone: data.timezone }),
      timezone: data.timezone,
      userName: user?.name || "",
    });

    const conversation = await prisma.aiConversation.create({
      data: {
        userId,
        messages: {
          create: [
            {
              role: "system",
              content: systemPrompt,
              metadata: { hidden: true },
            },
          ],
        },
      },
      include: {
        messages: {
          where: { role: { not: "system" } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return res.status(201).json({ conversation });
  } catch (error) {
    console.error("Error creating conversation", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// List conversations
assistantRouter.get("/conversations", requireLogin, async (req, res) => {
  const userId = req.userId;
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  try {
    const conversations = await prisma.aiConversation.findMany({
      where: {
        userId,
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
      },
      include: {
        messages: {
          where: { role: { not: "system" } },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error listing conversations", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// Get conversation with all messages
assistantRouter.get("/conversations/:id", requireLogin, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id as string;

  try {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          where: { role: { not: "system" } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("Error getting conversation", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// Delete a conversation
assistantRouter.delete("/conversations/:id", requireLogin, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id as string;

  try {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    await prisma.aiConversation.delete({ where: { id } });
    return res.status(200).json({ msg: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// Send message and get AI response
assistantRouter.post(
  "/conversations/:id/messages",
  requireLogin,
  async (req, res) => {
    const userId = req.userId;
    const conversationId = req.params.id as string;
    const { success, data, error } = SendMessageSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ msg: "Invalid message", error });
    }

    const useSSE = req.headers.accept === "text/event-stream";

    try {
      const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!conversation) {
        return res.status(404).json({ msg: "Conversation not found" });
      }

      // Store user message
      const userMessage = await prisma.aiMessage.create({
        data: {
          conversationId,
          role: "user",
          content: data.content,
        },
      });

      // Auto-generate title from first user message (non-blocking)
      if (!conversation.title) {
        openRouter.chatAssistant({
          systemPrompt: "Generate a short title (3-6 words, no quotes) that summarizes this message. Return ONLY the title, nothing else.",
          messages: [{ role: "user", content: data.content }],
          maxTokens: 30,
        }).then((title) => {
          const cleanTitle = title.trim().replace(/^["']|["']$/g, "").slice(0, 80);
          prisma.aiConversation.update({
            where: { id: conversationId },
            data: { title: cleanTitle },
          }).catch(() => {});
        }).catch(() => {
          // Fallback to truncated message
          prisma.aiConversation.update({
            where: { id: conversationId },
            data: { title: data.content.slice(0, 60) },
          }).catch(() => {});
        });
      }

      // Update conversation's updatedAt
      await prisma.aiConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Build conversation history for AI
      const systemMessage = conversation.messages.find(
        (m: { role: string }) => m.role === "system"
      );
      const conversationMessages = conversation.messages
        .filter((m: { role: string }) => m.role !== "system")
        .map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // Add the new user message
      conversationMessages.push({
        role: "user" as const,
        content: data.content,
      });

      // Non-streaming path
      if (!useSSE) {
        const { content, toolCallsMade } = await openRouter.chatWithTools({
          systemPrompt: systemMessage?.content || "",
          messages: conversationMessages,
          tools: TASK_TOOLS,
          userId,
          timezone: data.timezone,
        });

        const assistantMessage = await prisma.aiMessage.create({
          data: {
            conversationId,
            role: "assistant",
            content,
            metadata: { toolCalls: toolCallsMade },
          },
        });

        return res.status(200).json({ userMessage, assistantMessage });
      }

      // SSE streaming path
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      const sendEvent = (payload: Record<string, unknown>) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      sendEvent({ stage: "received", userMessage });
      sendEvent({ stage: "thinking" });

      let fullContent = "";
      let toolCallsMade: any[] = [];
      let clientDisconnected = false;
      req.on("close", () => {
        clientDisconnected = true;
      });

      try {
        const stream = openRouter.streamWithTools({
          systemPrompt: systemMessage?.content || "",
          messages: conversationMessages,
          tools: TASK_TOOLS,
          userId,
          timezone: data.timezone,
        });

        for await (const event of stream) {
          if (clientDisconnected) break;

          switch (event.type) {
            case "token":
              fullContent += event.content;
              sendEvent({ stage: "streaming", token: event.content });
              break;
            case "tool_call":
              sendEvent({ stage: "tool_call", tool: event.tool, args: event.args });
              break;
            case "tool_result":
              sendEvent({ stage: "tool_result", tool: event.tool, result: event.result });
              break;
            case "thinking":
              fullContent = "";
              sendEvent({ stage: "thinking" });
              break;
            case "done":
              toolCallsMade = event.toolCallsMade;
              break;
          }
        }
      } catch (streamError) {
        console.error("Error during AI streaming", streamError);
        sendEvent({ stage: "error", error: "AI response failed" });
        res.end();
        return;
      }

      // Store completed assistant message
      const assistantMessage = await prisma.aiMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: fullContent,
          ...(toolCallsMade.length > 0 && { metadata: { toolCalls: toolCallsMade } }),
        },
      });

      sendEvent({ stage: "complete", message: assistantMessage });
      res.end();
    } catch (error) {
      console.error("Error sending message", error);
      if (useSSE) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/event-stream" });
        }
        res.write(
          `data: ${JSON.stringify({ stage: "error", error: "Internal server error" })}\n\n`
        );
        res.end();
      } else {
        return res.status(500).json({ msg: "Internal server error" });
      }
    }
  }
);

export default assistantRouter;
