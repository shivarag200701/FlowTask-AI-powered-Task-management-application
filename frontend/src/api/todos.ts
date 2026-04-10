import { api } from "@/utils/api";
import type { Todo, TodoWithCompleteAtDateTime } from "@/types";
import { DateTime } from "luxon";

export async function fetchTodos(): Promise<TodoWithCompleteAtDateTime[]> {
  const { todos }: { todos: Todo[] } = (await api.get("/v1/todo/")).data;

  return todos.map((todo) => ({
    ...todo,
    completeAt: DateTime.fromISO(todo.completeAt ?? ""),
  }));
}

export async function updateTodo(
  data: TodoWithCompleteAtDateTime,
): Promise<TodoWithCompleteAtDateTime> {
  const res = await api.put(`/v1/todo/${data.id}`, {
    ...data,
  });

  return res.data.todo;
}
