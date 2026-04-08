import { fetchTodos } from "@/api";
import { todosQueryKeys } from "@/query-keys";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

function useOverDueTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: fetchTodos,
    staleTime: 60000,
    select: selectOverdueTodos,
  });
}

function selectOverdueTodos(todos: TodoWithCompleteAtDateTime[]) {
  return todos.filter(
    (todo) =>
      !todo.completed &&
      todo.completeAt &&
      todo.completeAt.startOf("day") < DateTime.now().startOf("day"),
  );
}
export default useOverDueTodos;
