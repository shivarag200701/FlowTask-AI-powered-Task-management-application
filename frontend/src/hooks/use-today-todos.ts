import { fetchTodos } from "@/api";
import { todosQueryKeys } from "@/query-keys";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

export function useTodayTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: fetchTodos,
    staleTime: 60000,
    select: selectTodayTodos,
  });
}

const selectTodayTodos = (todos: TodoWithCompleteAtDateTime[]) =>
  todos.filter(
    (t) => !t.completed && t.completeAt?.hasSame(DateTime.now(), "day"),
  );
