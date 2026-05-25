import { api } from "@/utils/functions/api";
import type { Todo, TodoWithCompleteAtDateTime } from "@/types";
import { DateTime } from "luxon";
import type {
  CreateTodo,
  TodoSearchDocument,
  UpdateTodo,
} from "@shiva200701/todotypes";

export async function fetchTodos(
  params?: Record<string, string | number | boolean | string[] | undefined>
): Promise<TodoWithCompleteAtDateTime[]> {
  try {
    const { todos }: { todos: Todo[] } = (
      await api.get("/api/v2/todo", params !== null ? { params } : undefined)
    ).data;

    return todos.map((todo) => ({
      ...todo,
      dueDate: todo.dueDate ? DateTime.fromISO(todo.dueDate) : null,
      dueTime: todo.dueTime ? DateTime.fromISO(todo.dueTime) : null,
      children: todo.children?.map((child) => ({
        ...child,
        dueDate: child.dueDate ? DateTime.fromISO(child.dueDate) : null,
        dueTime: child.dueTime ? DateTime.fromISO(child.dueTime) : null,
      })),
    }));
  } catch (error) {
    throw error;
  }
}

export async function updateTodo(
  data: UpdateTodo,
  id: string
): Promise<TodoWithCompleteAtDateTime> {
  try {
    const res = await api.patch(`/api/v2/todo/${id}`, {
      ...data,
    });

    return res.data.todo;
  } catch (error) {
    throw error;
  }
}

export async function serachTodo({ search }: { search: string }) {
  try {
    const { results }: { results: TodoSearchDocument[] } = (
      await api.get(`/api/v2/todo/search?q=${search}`)
    ).data;
    return results;
  } catch (error) {
    throw error;
  }
}

export async function deleteTodo(id: string) {
  try {
    await api.delete(`/api/v2/todo/${id}`);
  } catch (error) {
    throw error;
  }
}

export async function bulkDeleteTodos({ todoIds }: { todoIds: string[] }) {
  const ids = todoIds.join(",");
  try {
    await api.delete(`/api/v2/todo/bulk?todoIds=${ids}`);
  } catch (error) {
    throw error;
  }
}

export async function bulkUpdateTodos({
  todoIds,
  tags,
}: {
  todoIds: string[];
  tags: string[];
}) {
  const ids = todoIds.join(",");
  try {
    await api.patch(`/api/v2/todo/bulk?todoIds=${ids}`, { tags });
  } catch (error) {
    throw error;
  }
}

export async function createTodo(todo: CreateTodo) {
  await api.post(`/api/v2/todo`, {
    ...todo,
  });
}
