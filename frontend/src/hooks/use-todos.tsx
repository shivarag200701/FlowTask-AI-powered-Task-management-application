import { deleteTodo, fetchTodos, updateTodo } from "@/api";
import {
  bulkDeleteTodos,
  bulkUpdateTodos,
  createTodo,
  serachTodo,
} from "@/api/todos";
import { todosQueryKeys } from "@/query-keys";
import {
  toastMessages,
  type moveTodo,
  type TodosQuery,
  type TodoWithCompleteAtDateTime,
} from "@/types";
import type { CreateTodo, UpdateTodo } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { DateTime } from "luxon";
import { toast } from "sonner";
import { groupByCompletionDate } from "@/utils/functions/group-by-completion-date";

const selectOverdueTodos = (todos: TodoWithCompleteAtDateTime[]) => {
  const startOfToday = DateTime.now().startOf("day");
  return todos.filter(
    (todo) =>
      !todo.completed &&
      todo.dueDate &&
      todo.dueDate.startOf("day") < startOfToday
  );
};

const selectTodayTodos = (todos: TodoWithCompleteAtDateTime[]) =>
  todos.filter(
    (t) => !t.completed && t.dueDate && t.dueDate.hasSame(DateTime.now(), "day")
  );

export function useTodos(
  params?: Record<string, string | number | boolean | string[] | undefined>
) {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(params),
    staleTime: 60000,
  });
}

export function useSearchTodos(search: string) {
  return useQuery({
    queryKey: todosQueryKeys.search(search),
    queryFn: () => serachTodo({ search }),
    enabled: search.length > 0,
    staleTime: 60000,
  });
}

export function useFilteredTodos({ query }: { query: TodosQuery }) {
  return useQuery({
    queryKey: todosQueryKeys.filtered(query),
    queryFn: () => fetchTodos(query),
    staleTime: 60000,
  });
}

export function useUpcomingTodos(dateRange: DateTime[]) {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(),
    staleTime: 60000,
    select: (data) => {
      return data
        .filter(
          (t) =>
            !t.completed &&
            t.dueDate &&
            dateRange.some((d) => t.dueDate?.hasSame(d, "day"))
        )
        .sort((a, b) =>
          a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
        );
    },
  });
}

export function useTodayTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(),
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

export function useCompletedTodos() {
  return useQuery({
    queryKey: todosQueryKeys.completed(),
    queryFn: () => fetchTodos({ completed: "true" }),
    staleTime: 60000,
    select: groupByCompletionDate,
  });
}

export function useOverDueTodos() {
  return useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(),
    staleTime: 60000,
    select: selectOverdueTodos,
  });
}

export function useBulkDeleteTodos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ todoIds }: { todoIds: string[] }) => {
      await bulkDeleteTodos({ todoIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("Successfully deleted todos!");
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

export function useBulkUpdateTodos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      todoIds,
      tags,
    }: {
      todoIds: string[];
      tags: string[];
    }) => {
      await bulkUpdateTodos({ todoIds, tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("Successfully updated todos!");
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

      queryClient.setQueryData(
        todosQueryKeys.all,
        (old: TodoWithCompleteAtDateTime[] | undefined) =>
          old?.map((todo) => {
            if (todo.id === newTodo.id) {
              return { ...todo, ...newTodo.data };
            }
            // Check children
            if (todo.children?.some((c) => c.id === newTodo.id)) {
              return {
                ...todo,
                children: todo.children.map((c) =>
                  c.id === newTodo.id ? { ...c, ...newTodo.data } : c
                ),
              };
            }
            return todo;
          })
      );

      if (newTodo.type) {
        toast.success(toastMessages[newTodo.type], {
          action: {
            label: "Undo",
            onClick: () => {
              queryClient.setQueryData(todosQueryKeys.all, previousTodos);
              updateTodo(
                {
                  sortKey: oldTodo?.sortKey,
                  dueDate: oldTodo?.dueDate?.toISODate(),
                  dueTime: oldTodo?.dueTime?.toISO(),
                },
                newTodo.id
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
      console.log(_err);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      toast.success("todo created successfully");
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
