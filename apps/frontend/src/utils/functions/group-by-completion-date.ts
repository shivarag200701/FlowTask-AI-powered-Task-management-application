import type { TodoWithCompleteAtDateTime } from "@/types";
import { DateTime } from "luxon";

export type CompletedGroup = {
  label: string;
  todos: TodoWithCompleteAtDateTime[];
};

export function groupByCompletionDate(
  todos: TodoWithCompleteAtDateTime[]
): CompletedGroup[] {
  const now = DateTime.now();
  const startOfToday = now.startOf("day");
  const startOfYesterday = startOfToday.minus({ days: 1 });
  const startOfWeek = now.startOf("week");

  const groups: Record<string, TodoWithCompleteAtDateTime[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const todo of todos) {
    const completedAt = todo.completedAt
      ? DateTime.fromISO(todo.completedAt)
      : null;
    if (!completedAt) {
      groups["Older"].push(todo);
      continue;
    }
    if (completedAt >= startOfToday) {
      groups["Today"].push(todo);
    } else if (completedAt >= startOfYesterday) {
      groups["Yesterday"].push(todo);
    } else if (completedAt >= startOfWeek) {
      groups["This Week"].push(todo);
    } else {
      groups["Older"].push(todo);
    }
  }

  return Object.entries(groups)
    .filter(([, todos]) => todos.length > 0)
    .map(([label, todos]) => ({ label, todos }));
}
