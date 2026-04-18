import { z } from "zod";
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>;
    dueDate: z.ZodNullable<z.ZodString>;
    dueTime: z.ZodNullable<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reminder: z.ZodDefault<z.ZodBoolean>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateTodoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reminder: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isAllDay: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    prevIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    sortKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
//# sourceMappingURL=v2.d.ts.map