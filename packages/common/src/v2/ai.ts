import z from "zod";

export const AiParseTaskSchema = z.object({
  text: z.string().min(5),
  timezone: z.string(),
});

export interface ParsedTaskTag {
  id: string;
  name: string;
}

export const ParsedTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  dueTime: z.string().nullable(),
  priority: z.enum(["high", "medium", "low"]).nullable(),
  tags: z.array(z.string()),
  isAllDay: z.boolean(),
});

export interface ParsedTask {
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: "high" | "medium" | "low" | null;
  tags: ParsedTaskTag[];
  isAllDay: boolean;
}
