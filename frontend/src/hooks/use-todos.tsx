import { deleteTodo, fetchTodos, updateTodo } from "@/api";
import { createTodo } from "@/api/todos";
import { todosQueryKeys } from "@/query-keys";
import {
  toastMessages,
  type moveTodo,
  type TodoWithCompleteAtDateTime,
} from "@/types";
import type { CreateTodo, UpdateTodo } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
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
    mutationFn: ({
      data,
      id,
    }: {
      data: UpdateTodo;
      id: string;
      type?: moveTodo;
    }) => updateTodo(data, id),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKeys.all });
      const previousTodos: TodoWithCompleteAtDateTime[] | undefined =
        queryClient.getQueryData(todosQueryKeys.all);

      const oldTodo = previousTodos?.find((t) => t.id === newTodo.id);

      queryClient.setQueryData(todosQueryKeys.all, newTodo.data);

      if (newTodo.type) {
        toast.success(toastMessages[newTodo.type], {
          action: {
            label: "Undo",
            onClick: () => {
              queryClient.setQueryData(todosQueryKeys.all, previousTodos);
              updateTodo(
                {
                  sortKey: oldTodo?.sortKey,
                  dueDate: oldTodo?.dueDate,
                  dueTime: oldTodo?.dueTime?.toISO(),
                },
                newTodo.id,
              );
            },
          },
        });
      }
      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
    },

    onError: (_err, _newTodo, context) => {
      const queryClient = useQueryClient();
      toast.error("Error updating the todo");
      queryClient.setQueryData(todosQueryKeys.all, context?.previousTodos);
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("Todo deleted successfully");
    },
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: CreateTodo) => createTodo(todo),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKeys.all });
      queryClient.setQueryData(todosQueryKeys.all, todo);
      toast.success("todo created successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}
