import {
  GetTagsQuerySchema,
  todoQuerySchema,
  type CreateTodo,
  type InviteErrorCode,
  type RecurrenceRule,
  type ResourceColorsEnum,
} from "@shiva200701/todotypes";
import { CircleAlert, Unlink, UserRoundCheck, Users } from "lucide-react";
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
  icon?: string;
  inviteCode: string;
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
  role: "owner" | "member";
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

export type InviteResult =
  | { success: true; msg: string; slug: string }
  | {
      success: false;
      code: InviteErrorCode;
      slug?: string;
    };

export const INVITE_ERROR_MESSAGES = {
  ALREADY_MEMBER: {
    title: "You're already a member",
    description: "You're already part of this workspace.",
    icon: UserRoundCheck,
  },
  INVALID_ERROR_CODE: {
    title: "Invalid Invite Link",
    description:
      "The invite link you are trying to use is invalid. Please contact the workspace owner for more information.",
    icon: Unlink,
  },
  USER_LIMIT_REACHED: {
    title: "Workspace is full",
    description: "This workspace has reached its member limit.",
    icon: Users,
  },
  UNKNOWN: {
    title: "Something went wrong",
    description: "Please try again later.",
    icon: CircleAlert,
  },
} as const;

export type InvitePreview = {
  success: boolean;
  workspace: {
    name: string;
    icon: string | null;
    memberCount: number;
    slug: string;
    id: string;
  };
  role: string;
  email: string;
};
