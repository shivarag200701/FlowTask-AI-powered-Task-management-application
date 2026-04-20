import { z } from "zod";

export const RESOURCE_COLORS_DATA = [
  {
    color: "red",
    tagVariants: "bg-red-100 text-red-600",
  },
  {
    color: "yellow",
    tagVariants: "bg-yellow-100 text-yellow-600",
  },
  {
    color: "green",
    tagVariants: "bg-green-100 text-green-600",
  },
  {
    color: "blue",
    tagVariants: "bg-blue-100 text-blue-600",
  },
  {
    color: "purple",
    tagVariants: "bg-purple-100 text-purple-600",
  },
  {
    color: "brown",
    tagVariants: "bg-brown-100 text-brown-600",
  },
  {
    color: "gray",
    tagVariants: "bg-gray-100 text-gray-600",
  },
] as const;

export const RESOURCE_COLORS = RESOURCE_COLORS_DATA.map((c) => c.color);

export const TagColorSchema = z.enum(RESOURCE_COLORS);

export type ResourceColorsEnum = z.infer<typeof TagColorSchema>;

export const CreateTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: TagColorSchema.optional(),
});

export const UpdateTagSchema = CreateTagSchema.partial();

export const CreateTodoSchema = z.object({
  title: z.string().min(1, "title must be atleast one character"),
  description: z
    .string()
    .min(1, "description must be atleast one character")
    .optional(),
  priority: z.enum(["high", "medium", "low"]).nullable(),
  dueDate: z.string().nullable(), //all todos with date will have this
  dueTime: z.string().nullable(), //only timed todos have this
  color: z.string().nullish(),
  reminder: z.boolean().default(false),
  isAllDay: z.boolean().optional(), // send true only, if not sent, the database defaults to false
});

export const UpdateTodoSchema = CreateTodoSchema.partial().extend({
  prevIndex: z.string().nullish(),
  nextIndex: z.string().nullish(),
  completed: z.boolean().optional(),
  sortKey: z.string().optional(),
});

export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
