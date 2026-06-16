import z from "zod";
export declare const AiParseTaskSchema: z.ZodObject<{
    text: z.ZodString;
    timezone: z.ZodString;
}, z.core.$strip>;
export interface ParsedTask {
    title: string;
    description: string | null;
    dueDate: string | null;
    dueTime: string | null;
    priority: "high" | "medium" | "low" | null;
    tags: string[];
    isAllDay: boolean;
}
//# sourceMappingURL=ai.d.ts.map