import type { CreateTodoWithDateTime } from "@/types";
import type { CreateTodo } from "@shiva200701/todotypes";

export function SerializeFormData(
  data: Partial<CreateTodoWithDateTime>
): Partial<CreateTodo> {
  const { dueDate, dueTime, tags, ...rest } = data;

  return {
    ...rest,
    ...(dueDate !== undefined && {
      dueDate: dueDate?.toISODate() ?? null,
    }),
    ...(dueTime !== undefined && {
      dueTime: dueTime?.toISO() ?? null,
    }),
    ...(tags !== undefined && {
      tags: tags?.map((tag) => tag.id),
    }),
  };
}
