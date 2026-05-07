import {
  GetTagsQuerySchema,
  todoQuerySchema,
  type CreateTodo,
  type ResourceColorsEnum,
} from "@shiva200701/todotypes";
import type { DateTime } from "luxon";
import type z from "zod";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  isPasswordSet: boolean;
  image: string | null;
  provider: string | null;
  isOAuthLinked: boolean;
  createdAt: string | null;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low" | null;
  isAllDay: boolean;
  dueDate: string | null;
  dueTime: string | null;
  category: string;
  completed: boolean;
  completedAt: string | null;
  color?: string | null;
  sortKey: string;
  createdAt: string | null;
  reminder?: boolean;
  tags?: TodoTag[];
}

export type TodoTag = Omit<TagProps, "_count">;

export interface TagProps {
  id: string;
  name: string;
  color: ResourceColorsEnum;
  _count: { todos: number };
}

export type TagsQuery = z.infer<typeof GetTagsQuerySchema>;

export type TodosQuery = z.infer<typeof todoQuerySchema>;

export type TodoWithCompleteAtDateTime = Omit<Todo, "dueTime" | "dueDate"> & {
  dueDate: DateTime | null;
  dueTime: DateTime | null;
};

export type moveTodo = "updateDate" | "updateOrder";

export const toastMessages: Record<moveTodo, string> = {
  updateOrder: "Order Changed",
  updateDate: "Date updated",
};

export type ViewMode = "list" | "board" | "calendar";

export type CreateTodoWithDateTime = Omit<
  CreateTodo,
  "dueTime" | "dueDate" | "tags"
> & {
  dueTime: DateTime | null;
  dueDate: DateTime | null;
  tags?: TodoTag[];
};
