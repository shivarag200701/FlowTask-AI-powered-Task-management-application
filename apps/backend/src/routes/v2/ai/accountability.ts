import { Router } from "express";
import { requireLogin } from "../../../middleware/requireLogin.js";
import { StartSessionSchema, SendMessageSchema } from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";
import openRouter from "../../../services/ai/OpenRouterService.js";
import accountabilityService from "../../../services/accountability/AccountabilityService.js";
import {
  buildDailyStandupPrompt,
  buildFreeformChatPrompt,
} from "../../../services/ai/prompts/accountability.js";
import { TASK_TOOLS } from "../../../services/ai/tools/tasks/definitions.js";

const accountabilityRouter = Router();

// Start a new session
accountabilityRouter.post("/sessions", requireLogin, async (req, res) => {
  const userId = req.userId;
  const { success, data, error } = StartSessionSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ msg: "Invalid request data", error });
  }

  try {
    // Check for existing active session of same type
    const existingSession = await prisma.accountabilitySession.findFirst({
      where: { userId, status: "ACTIVE", type: data.type },
    });

    if (existingSession) {
      const session = await prisma.accountabilitySession.findUnique({
        where: { id: existingSession.id },
        include: {
          messages: {
            where: { role: { not: "system" } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      return res.status(200).json({ session });
    }

    // Build task snapshot
    const snapshot = await accountabilityService.buildTaskSnapshot(
      userId,
      data.timezone
    );

    // Get user preferences
    const preferences = await prisma.userPrefrence.findUnique({
      where: { userId },
    });
    const tone =
      (preferences?.accountabilityTone as "supportive" | "direct" | "tough") ||
      "supportive";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Get completion rates
    const [rate7d, rate30d] = await Promise.all([
      accountabilityService.computeCompletionRate(userId, 7),
      accountabilityService.computeCompletionRate(userId, 30),
    ]);

    // Build date/time context from user's timezone
    const now = new Date();
    const dateTimeCtx = {
      today: now.toLocaleDateString("en-CA", { timeZone: data.timezone }),
      currentTime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: data.timezone }),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long", timeZone: data.timezone }),
      timezone: data.timezone,
    };

    // Build system prompt based on session type
    let systemPrompt: string;
    if (data.type === "DAILY_STANDUP") {
      systemPrompt = buildDailyStandupPrompt({
        ...dateTimeCtx,
        tone,
        userName: user?.name || "",
        yesterdayCompleted: accountabilityService.formatTasksForPrompt(
          snapshot.yesterdayCompleted
        ),
        yesterdayIncomplete: accountabilityService.formatTasksForPrompt(
          snapshot.yesterdayIncomplete
        ),
        todayTasks: accountabilityService.formatTasksForPrompt(
          snapshot.todayTasks
        ),
        overdueTasks: accountabilityService.formatTasksForPrompt(
          snapshot.overdueTasks
        ),
        completionRate7d: rate7d,
        completionRate30d: rate30d,
      });
    } else {
      systemPrompt = buildFreeformChatPrompt({
        ...dateTimeCtx,
        tone,
        userName: user?.name || "",
        todayTasks: accountabilityService.formatTasksForPrompt(
          snapshot.todayTasks
        ),
        overdueTasks: accountabilityService.formatTasksForPrompt(
          snapshot.overdueTasks
        ),
        recentCompletions: accountabilityService.formatTasksForPrompt(
          snapshot.recentCompletions
        ),
        completionRate7d: rate7d,
      });
    }

    // Get AI opening message
    const aiMessage = await openRouter.chatAccountability({
      systemPrompt,
      messages: [],
    });

    // Create session with opening message
    const session = await prisma.accountabilitySession.create({
      data: {
        userId,
        type: data.type,
        status: "ACTIVE",
        taskSnapshot: snapshot as any,
        messages: {
          create: [
            {
              role: "system",
              content: systemPrompt,
              metadata: { hidden: true },
            },
            { role: "assistant", content: aiMessage },
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

    return res.status(201).json({ session });
  } catch (error) {
    console.error("Error creating accountability session", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// List sessions
accountabilityRouter.get("/sessions", requireLogin, async (req, res) => {
  const userId = req.userId;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  try {
    const sessions = await prisma.accountabilitySession.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        messages: {
          where: { role: { not: "system" } },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error listing sessions", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// Get session with all messages
accountabilityRouter.get("/sessions/:id", requireLogin, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id as string;

  try {
    const session = await prisma.accountabilitySession.findFirst({
      where: { id, userId },
      include: {
        messages: {
          where: { role: { not: "system" } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    return res.status(200).json({ session });
  } catch (error) {
    console.error("Error getting session", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// Send message and get AI response
accountabilityRouter.post(
  "/sessions/:id/messages",
  requireLogin,
  async (req, res) => {
    const userId = req.userId;
    const sessionId = req.params.id as string;
    const { success, data, error } = SendMessageSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ msg: "Invalid message", error });
    }

    const useSSE = req.headers.accept === "text/event-stream";

    try {
      const session = await prisma.accountabilitySession.findFirst({
        where: { id: sessionId, userId, status: "ACTIVE" },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!session) {
        return res.status(404).json({ msg: "Active session not found" });
      }

      // Store user message
      const userMessage = await prisma.accountabilityMessage.create({
        data: {
          sessionId,
          role: "user",
          content: data.content,
        },
      });

      // Build conversation history for AI
      const systemMessage = session.messages.find(
        (m: { role: string }) => m.role === "system"
      );
      const conversationMessages = session.messages
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

      // Non-streaming path (existing behavior)
      if (!useSSE) {
        const { content, toolCallsMade } = await openRouter.chatWithTools({
          systemPrompt: systemMessage?.content || "",
          messages: conversationMessages,
          tools: TASK_TOOLS,
          userId,
          timezone: data.timezone,
        });

        // Store assistant message with metadata about what tools were called
        const assistantMessage = await prisma.accountabilityMessage.create({
          data: {
            sessionId,
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
              // Reset content for the next AI turn (final text response)
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
      const assistantMessage = await prisma.accountabilityMessage.create({
        data: {
          sessionId,
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

// Complete/close a session
accountabilityRouter.patch("/sessions/:id", requireLogin, async (req, res) => {
  const userId = req.userId;
  const id = req.params.id as string;
  const { status } = req.body;

  if (!["COMPLETED", "EXPIRED"].includes(status)) {
    return res
      .status(400)
      .json({ msg: "Invalid status. Must be COMPLETED or EXPIRED" });
  }

  try {
    const session = await prisma.accountabilitySession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    const updated = await prisma.accountabilitySession.update({
      where: { id },
      data: {
        status,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({ session: updated });
  } catch (error) {
    console.error("Error updating session", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default accountabilityRouter;
