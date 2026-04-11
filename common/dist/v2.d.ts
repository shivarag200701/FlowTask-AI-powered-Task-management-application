import { z } from "zod";
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>;
    completeAt: z.ZodNullable<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reminder: z.ZodDefault<z.ZodBoolean>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
//# sourceMappingURL=v2.d.ts.map