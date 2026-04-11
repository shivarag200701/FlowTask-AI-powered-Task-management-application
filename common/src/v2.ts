import { z } from "zod";

export const CreateTodoSchema = z.object({
  title: z.string().min(1, "title must be atleast one character"),
  description: z
    .string()
    .min(1, "description must be atleast one character")
    .optional(),
  priority: z.enum(["high", "medium", "low"]).nullable(),
  completeAt: z.string().nullable(), //no due date
  color: z.string().nullish(),
  reminder: z.boolean().default(false),
  isAllDay: z.boolean().optional(), // send true only, if not sent, the database defaults to false
});

export type CreateTodo = z.infer<typeof CreateTodoSchema>;
