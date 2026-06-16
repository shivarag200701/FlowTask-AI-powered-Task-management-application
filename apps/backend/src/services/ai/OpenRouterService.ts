import { OpenRouter } from "@openrouter/sdk";

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
}

const openRouter = new OpenRouterService();

export default openRouter;
