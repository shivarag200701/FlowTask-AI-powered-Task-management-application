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
  id?: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low" | null;
  completeAt: string | null;
  isAllDay: boolean;
  category: string;
  completed: boolean;
  completedAt: string | null;
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly" | null;
  recurrenceInterval?: number | null;
  recurrenceEndDate?: string | null;
  parentRecurringId?: number | null;
  nextOccurrence?: string | null;
  color?: string | null;
  order?: number | null;
  createdAt: string | null;
  reminder?: boolean;
}

export type TodoWithCompleteAtDateTime = Omit<Todo, "completeAt"> & {
  completeAt: DateTime | null;
};

export type ViewMode = "list" | "board" | "calendar";
