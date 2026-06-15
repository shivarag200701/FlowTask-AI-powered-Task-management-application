import { OpenRouter } from "@openrouter/sdk";
import "dotenv/config";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const today = new Date().toISOString().split("T")[0]; // "2026-06-15"
const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }); // "Monday"

// const result = await openRouter.chat.send({
//   chatRequest: {
//     model: "google/gemini-2.5-flash",
//     messages: [
//       {
//         role: "system",
//         content: `You are a task parser. Today is ${dayOfWeek}, ${today}.

// Parse the user's natural language input into a JSON object with these fields:
// - "title": the core task name (strip dates, priorities, tags from it)
// - "description": null unless the user explicitly provides extra detail
// - "dueDate": ISO date string (YYYY-MM-DD) or null. Resolve relative dates like "tomorrow", "next Friday" relative to today.
// - "dueTime": 24h time string (HH:mm) or null. Only set if a specific time is mentioned.
// - "isAllDay": true if no specific time is mentioned, false otherwise
// - "priority": "high" | "medium" | "low" | null. Infer from words like "urgent", "important", "low priority". Default null.
// - "tags": array of strings extracted from #hashtags. Empty array if none.

// Return ONLY the raw JSON object. No markdown, no code fences, no explanation.`,
//       },
//       {
//         role: "user",
//         content:
//           "Complete implementing openRouter implementation of task breakdown by tomorrow 5pm #flowTask, !urgent",
//       },
//     ],
//     maxTokens: 512,
//     responseFormat: { type: "json_object" },
//   },
// });

// const parsed = JSON.parse(result.choices[0].message.content as string);
// console.log(parsed);

async function run() {
  const result = await openRouter.credits.getCredits();
  console.log(result);
}
run();
