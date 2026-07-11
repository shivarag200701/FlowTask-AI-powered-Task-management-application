import { OpenRouter } from "@openrouter/sdk";
import { executeToolCall } from "./tools/tasks/handler.js";

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content?: string | undefined;
      toolCalls?: any[] | undefined;
    }
  | { role: "tool"; toolCallId: string; content: string };

export type ToolCallRecord = {
  tool: string;
  args: Record<string, any>;
  result: any;
};

export type StreamWithToolsEvent =
  | { type: "token"; content: string }
  | { type: "tool_call"; tool: string; args: Record<string, any> }
  | { type: "tool_result"; tool: string; result: any }
  | { type: "thinking" }
  | { type: "done"; toolCallsMade: ToolCallRecord[] };

class OpenRouterService {
  private client: OpenRouter;

  constructor() {
    this.client = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async chat({ message, timezone }: { message: string; timezone: string }) {
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const result = await this.client.chat.send({
      chatRequest: {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a task parser. Today is ${dayOfWeek}, ${today}. The user's timezone is ${timezone}.

        Parse the user's natural language input into a JSON object with these fields:
        - "title": the core task name (strip dates, priorities, tags from it)
        - "description": null unless the user explicitly provides extra detail
        - "dueDate": ISO date string (YYYY-MM-DD) or null. Resolve relative dates like "tomorrow", "next Friday" relative to today.
        - "dueTime": ISO 8601 datetime string with the user's timezone offset (e.g. "2026-06-16T17:00:00.000-05:00" for America/Chicago). Convert the user's local time to the correct offset based on their timezone. Do NOT use "Z" unless the user is in UTC. Only set if a specific time is mentioned.
        - "isAllDay": true if no specific time is mentioned, false otherwise
        - "priority": "high" | "medium" | "low" | null. Infer from words like "urgent", "important", "low priority". Default null.
        - "tags": array of strings extracted from #hashtags. Empty array if none.

        Return ONLY the raw JSON object. No markdown, no code fences, no explanation.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        maxTokens: 512,
        responseFormat: { type: "json_object" },
      },
    });

    return JSON.parse(result?.choices[0]?.message.content as string);
  }
  async chatAccountability({
    systemPrompt,
    messages,
    maxTokens = 1024,
  }: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    maxTokens?: number;
  }): Promise<string> {
    const result = await this.client.chat.send({
      chatRequest: {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        maxTokens,
      },
    });

    return (result?.choices[0]?.message.content as string) || "";
  }

  async *streamAccountability({
    systemPrompt,
    messages,
    maxTokens = 1024,
  }: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    maxTokens?: number;
  }): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.send({
      chatRequest: {
        stream: true,
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        maxTokens,
      },
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async *streamWithTools({
    systemPrompt,
    messages,
    tools,
    userId,
    timezone,
    maxTokens = 1024,
  }: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    tools: any[];
    userId: string;
    timezone: string;
    maxTokens?: number;
  }): AsyncGenerator<StreamWithToolsEvent, void, unknown> {
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const allToolCallsMade: ToolCallRecord[] = [];
    const maxIterations = 5;

    for (let i = 0; i < maxIterations; i++) {
      const stream = await this.client.chat.send({
        chatRequest: {
          stream: true,
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools,
          maxTokens,
        },
      });

      let textContent = "";
      const toolCalls = new Map<
        number,
        { id: string; name: string; arguments: string }
      >();

      for await (const chunk of stream as any) {
        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;

        // Text tokens
        if (delta.content) {
          textContent += delta.content;
          yield { type: "token", content: delta.content };
        }

        // Accumulate tool call deltas (SDK uses camelCase `toolCalls`)
        if (delta.toolCalls) {
          for (const tc of delta.toolCalls) {
            const idx = tc.index ?? 0;
            if (!toolCalls.has(idx)) {
              toolCalls.set(idx, { id: "", name: "", arguments: "" });
            }
            const existing = toolCalls.get(idx)!;
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name = tc.function.name;
            if (tc.function?.arguments)
              existing.arguments += tc.function.arguments;
          }
        }
      }

      // No tool calls — this was the final text response
      if (toolCalls.size === 0) {
        yield { type: "done", toolCallsMade: allToolCallsMade };
        return;
      }

      // Push the assistant message (with tool calls) into conversation
      conversationMessages.push({
        role: "assistant",
        content: textContent || undefined,
        toolCalls: Array.from(toolCalls.values()).map((tc) => ({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: tc.arguments },
        })),
      });

      // Execute each tool call
      for (const tc of toolCalls.values()) {
        const args = JSON.parse(tc.arguments);
        yield { type: "tool_call", tool: tc.name, args };

        const result = await executeToolCall(tc.name, args, userId, timezone);
        const parsed = JSON.parse(result);

        allToolCallsMade.push({ tool: tc.name, args, result: parsed });
        yield { type: "tool_result", tool: tc.name, result: parsed };

        conversationMessages.push({
          role: "tool",
          toolCallId: tc.id,
          content: result,
        });
      }

      // Signal that we're going back to the model for another turn
      yield { type: "thinking" };
    }

    // Exhausted iterations
    yield { type: "done", toolCallsMade: allToolCallsMade };
  }

  async chatWithTools({
    systemPrompt,
    messages,
    tools,
    userId,
    timezone,
    maxTokens = 1024,
  }: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    tools: any[];
    userId: string;
    timezone: string;
    maxTokens?: number;
  }) {
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const toolCallsMade: any[] = [];
    const maxIterations = 5;

    for (let i = 0; i < maxIterations; i++) {
      const result = await this.client.chat.send({
        chatRequest: {
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools,
          maxTokens: 1024,
        },
      });

      const choice = result.choices[0];
      const assistantMessage = choice?.message;
      if (!assistantMessage) {
        throw new Error("AI returned an empty response");
      }
      conversationMessages.push(assistantMessage);

      if (
        !assistantMessage.toolCalls ||
        assistantMessage.toolCalls.length === 0
      ) {
        return { content: assistantMessage.content || "", toolCallsMade };
      }

      for (const toolCall of assistantMessage.toolCalls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeToolCall(
          toolCall.function.name,
          args,
          userId,
          timezone
        );
        toolCallsMade.push({
          tool: toolCall.function.name,
          args,
          result,
        });

        // Feed result back so the model sees it in the next iteration
        conversationMessages.push({
          role: "tool",
          toolCallId: toolCall.id,
          content: result,
        });
      }
    }

    return { content: "I've completed the actions above.", toolCallsMade };
  }
}

const openRouter = new OpenRouterService();

export default openRouter;
