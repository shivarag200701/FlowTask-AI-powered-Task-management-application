import {
  GetTagsQuerySchema,
  todoQuerySchema,
  type CreateTodo,
  type RecurrenceRule,
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
  parentId: string | undefined;
  children?: Omit<Todo, "children">[];
  projectId?: string;
  projectSectionId?: string | null;
  recurrenceRule?: RecurrenceRule;
  recurrenceEndDate?: string | null;
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

export type ChildTodoWithDateTime = Omit<
  Todo,
  "dueTime" | "dueDate" | "children"
> & {
  dueDate: DateTime | null;
  dueTime: DateTime | null;
};

export type TodoWithCompleteAtDateTime = Omit<
  Todo,
  "dueTime" | "dueDate" | "children"
> & {
  dueDate: DateTime | null;
  dueTime: DateTime | null;
  children?: ChildTodoWithDateTime[];
};

export type moveTodo = "updateDate" | "updateOrder" | "updateProject";

export const toastMessages: Record<moveTodo, string> = {
  updateOrder: "Order Changed",
  updateDate: "Date updated",
  updateProject: "Task moved",
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

export type Project = {
  id: string;
  name: string;
  personal: boolean;
  slug: string | null;
  userId: string;
  workspaceId: string | null;
  taskDisplayPreferences?: { viewMode: ViewMode };
  todos: Todo[];
  sections: SectionWithoutTodos[];
};

export type Section = {
  id: string;
  name: string;
  sortKey: string;
  projectId: string;
  todos: Todo[];
};

export type SectionWithDateTime = Omit<Section, "todos"> & {
  todos: TodoWithCompleteAtDateTime[];
};

export type SectionWithoutTodos = Omit<Section, "todos">;

export type ProjectWithDateTime = Omit<Project, "todos"> & {
  todos: TodoWithCompleteAtDateTime[];
};

export type Workspace = {
  id: string;
  createdAt: string;
  createdBy: string;
  icon: string | null;
  inviteCode: string | null;
  name: string;
  slug: string;
  updatedAt: string;
  _count: {
    members: number;
  };
};

export type Workspaces = Workspace[];

export type WorkspaceMember = {
  id: string;
  role: "owner" | "admin" | "member";
  userId: string;
  workspaceId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export type WorkspaceDetail = Omit<Workspace, "_count"> & {
  members: WorkspaceMember[];
};
