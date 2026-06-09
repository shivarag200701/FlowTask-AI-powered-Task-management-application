import type { TodoWithCompleteAtDateTime } from "@/types";
import { useDeleteTodo } from "./use-todos";
import { useConfirmModal } from "@/components/modals/ConfirmModal";

export function useDeleteTodoConfirmModal(todo: TodoWithCompleteAtDateTime) {
  const { mutate: deleteTodo } = useDeleteTodo();

  return useConfirmModal({
    title: "Delete task?",
    description: (
      <div>
        The <span className="font-bold">{todo.title}</span> task will be
        permanently deleted.
      </div>
    ),
    onConfirm() {
      deleteTodo(todo.id);
    },
    variant: "destructive",
  });
}
