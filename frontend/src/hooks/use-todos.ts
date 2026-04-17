import { deleteTodo, fetchTodos, updateTodo } from "@/api";
import { todosQueryKeys } from "@/query-keys";
import type { TodoWithCompleteAtDateTime } from "@/types";
import type { UpdateTodo } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { toast } from "sonner";

const selectOverdueTodos = (todos: TodoWithCompleteAtDateTime[]) => {
  return todos.filter((todo) => {
    return (
      !todo.completed &&
      todo.dueDate &&
      todo.dueDate < DateTime.now().toFormat("yyyy-MM-dd")
    );
  });
};

const selectTodayTodos = (todos: TodoWithCompleteAtDateTime[]) =>
  todos.filter((t) => {
    return (
      !t.completed &&
      t.dueDate &&
      t.dueDate === DateTime.now().toFormat("yyyy-MM-dd")
    );
  });

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
    select: (data) => {
      const todoTodos = selectTodayTodos(data);
      return todoTodos.sort((a, b) => {
        if (a.sortKey < b.sortKey) return -1;
        if (a.sortKey > b.sortKey) return 1;
        return 0;
      });
    },
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
    mutationFn: ({ data, id }: { data: UpdateTodo; id: number }) =>
      updateTodo(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("Todo updated");
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("Todo deleted");
    },
  });
}
