import type { DateTime } from "luxon";

export interface User {
  id: number;
  name: string | null;
  email: string | null;
  isPasswordSet: boolean;
  image: string | null;
  provider: string | null;
  isOAuthLinked: boolean;
  createdAt: string | null;
}

export interface Todo {
  id: number;
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
}

export type TodoWithCompleteAtDateTime = Omit<Todo, "dueTime"> & {
  dueTime: DateTime | null;
};

export type ViewMode = "list" | "board" | "calendar";
