import type { CreateTodoWithDateTime } from "@/types";
import type { CreateTodo } from "@shiva200701/todotypes";

export function SerializeFormData(data: CreateTodoWithDateTime): CreateTodo {
  return {
    ...data,
    dueDate: data.dueDate?.toISODate() ?? null,
    dueTime: data.dueTime?.toISO() ?? null,
    tags: data.tags?.map((tag) => tag.id),
  };
}
