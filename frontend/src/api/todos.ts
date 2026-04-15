import { api } from "@/utils/api";
import type { Todo, TodoWithCompleteAtDateTime } from "@/types";
import { DateTime } from "luxon";
import type { UpdateTodo } from "@shiva200701/todotypes";

export async function fetchTodos(): Promise<TodoWithCompleteAtDateTime[]> {
  const { todos }: { todos: Todo[] } = (await api.get("/api/v2/todo")).data;

  return todos.map((todo) => ({
    ...todo,
    dueTime: DateTime.fromISO(todo.dueTime ?? ""),
  }));
}

export async function updateTodo(
  data: UpdateTodo,
  id: number,
): Promise<TodoWithCompleteAtDateTime> {
  const res = await api.patch(`/api/v2/todo/${id}`, {
    ...data,
  });

  return res.data.todo;
}
