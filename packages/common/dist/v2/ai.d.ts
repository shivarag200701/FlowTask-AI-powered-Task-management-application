import z from "zod";
export declare const AiParseTaskSchema: z.ZodObject<{
    text: z.ZodString;
    timezone: z.ZodString;
}, z.core.$strip>;
export interface ParsedTaskTag {
    id: string;
    name: string;
}
export declare const ParsedTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    dueDate: z.ZodNullable<z.ZodString>;
    dueTime: z.ZodNullable<z.ZodString>;
    priority: z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>;
    tags: z.ZodArray<z.ZodString>;
    isAllDay: z.ZodBoolean;
}, z.core.$strip>;
export interface ParsedTask {
    title: string;
    description: string | null;
    dueDate: string | null;
    dueTime: string | null;
    priority: "high" | "medium" | "low" | null;
    tags: ParsedTaskTag[];
    isAllDay: boolean;
}
//# sourceMappingURL=ai.d.ts.map