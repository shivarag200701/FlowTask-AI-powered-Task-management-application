import z from "zod";
export const CreateTodoSchema = z.object({
    title: z.string().min(1, "title must be atleast one character"),
    description: z.string().optional(),
    priority: z.enum(["high", "medium", "low"]).nullable(),
    dueDate: z.string().nullable(), //all todos with date will have this
    dueTime: z.string().nullable(), //only timed todos have this
    color: z.string().nullish(),
    reminder: z.boolean().default(false),
    isAllDay: z.boolean().optional(), // send true only, if not sent, the database defaults to false
    tags: z
        .union([z.string(), z.array(z.string())])
        .transform((v) => (Array.isArray(v) ? v : v.split(",")))
        .optional()
        .meta({
        id: "todo_tag_ids",
        title: "tag ids",
        description: "ids of tags associated with the todo",
    }),
    parentId: z.string().nullish(),
});
export const todoQuerySchema = z.object({
    tagIds: z.string().optional(),
});
export const UpdateTodoSchema = CreateTodoSchema.partial().extend({
    prevIndex: z.string().nullish(),
    nextIndex: z.string().nullish(),
    completed: z.boolean().optional(),
    sortKey: z.string().optional(),
});
export const TodoBulkDeleteSchema = z.object({
    todoIds: z.string(),
});
export const TodoSearchDocumentSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    userId: z.string(),
    completed: z.boolean(),
    priority: z.string().nullable(),
    parentId: z.string().nullable(),
    dueDate: z.string().nullable(),
    createdAt: z.string(),
});
//# sourceMappingURL=todo.js.map