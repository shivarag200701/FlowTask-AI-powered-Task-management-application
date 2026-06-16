import z from "zod";

export const AiParseTaskSchema = z.object({
  text: z.string().min(10),
  timezone: z.string(),
});

export interface ParsedTask {
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: "high" | "medium" | "low" | null;
  tags: string[];
  isAllDay: boolean;
}
