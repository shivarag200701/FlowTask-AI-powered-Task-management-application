import z from "zod";
export declare const RecurrenceRuleSchema: z.ZodObject<{
    pattern: z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        yearly: "yearly";
        custom: "custom";
        montly: "montly";
    }>;
    interval: z.ZodDefault<z.ZodInt>;
    daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodInt>>;
    daysOfMonth: z.ZodOptional<z.ZodArray<z.ZodInt>>;
}, z.core.$strip>;
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>;
    dueDate: z.ZodNullable<z.ZodString>;
    dueTime: z.ZodNullable<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reminder: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    isAllDay: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    tags: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    projectSectionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    recurrenceRule: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        pattern: z.ZodEnum<{
            daily: "daily";
            weekly: "weekly";
            yearly: "yearly";
            custom: "custom";
            montly: "montly";
        }>;
        interval: z.ZodDefault<z.ZodInt>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodInt>>;
        daysOfMonth: z.ZodOptional<z.ZodArray<z.ZodInt>>;
    }, z.core.$strip>>>;
    recurrenceEndDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const todoQuerySchema: z.ZodObject<{
    tagIds: z.ZodOptional<z.ZodString>;
    completed: z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>;
}, z.core.$strip>;
export declare const UpdateTodoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    priority: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reminder: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
    isAllDay: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    projectId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    projectSectionId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    recurrenceRule: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        pattern: z.ZodEnum<{
            daily: "daily";
            weekly: "weekly";
            yearly: "yearly";
            custom: "custom";
            montly: "montly";
        }>;
        interval: z.ZodDefault<z.ZodInt>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodInt>>;
        daysOfMonth: z.ZodOptional<z.ZodArray<z.ZodInt>>;
    }, z.core.$strip>>>>;
    recurrenceEndDate: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    prevIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    sortKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TodoBulkDeleteSchema: z.ZodObject<{
    todoIds: z.ZodString;
}, z.core.$strip>;
export declare const TodoSearchDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    userId: z.ZodString;
    completed: z.ZodBoolean;
    priority: z.ZodNullable<z.ZodString>;
    parentId: z.ZodNullable<z.ZodString>;
    dueDate: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
export type TodoSearchDocument = z.infer<typeof TodoSearchDocumentSchema>;
export type RecurrenceRule = z.infer<typeof RecurrenceRuleSchema>;
//# sourceMappingURL=todo.d.ts.map