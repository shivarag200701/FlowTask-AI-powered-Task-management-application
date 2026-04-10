import { fetchTodos } from "@/api";
import { updateTodo } from "@/api/todos";
import { todosQueryKeys } from "@/query-keys";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";

const selectOverdueTodos = (todos: TodoWithCompleteAtDateTime[]) => {
  return todos.filter(
    (todo) =>
      !todo.completed &&
      todo.completeAt &&
      todo.completeAt.startOf("day") < DateTime.now().startOf("day"),
  );
};

const selectTodayTodos = (todos: TodoWithCompleteAtDateTime[]) =>
  todos.filter(
    (t) =>
      !t.completed &&
      t.completeAt &&
      t.completeAt.hasSame(DateTime.now(), "day"),
  );

export function useTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: fetchTodos,
    staleTime: 60000,
  });
}

export function useTodayTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: fetchTodos,
    staleTime: 60000,
    select: selectTodayTodos,
  });
}

export function useOverDueTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: fetchTodos,
    staleTime: 60000,
    select: selectOverdueTodos,
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TodoWithCompleteAtDateTime) => updateTodo(data),
    onSuccess: (data: TodoWithCompleteAtDateTime) => {
      // queryClient.setQueryData<TodoWithCompleteAtDateTime[]>(
      //   todosQueryKeys.all,
      //   (oldData) => {
      //     if (!oldData) return oldData;
      //     return oldData.map((todo) => (todo.id === data.id ? data : todo));
      //   },
      // );
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
    },
  });
}
