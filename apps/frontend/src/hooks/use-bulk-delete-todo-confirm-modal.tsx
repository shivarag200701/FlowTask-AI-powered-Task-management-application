import { useConfirmModal } from "@/components/modals/ConfirmModal";
import { useMemo } from "react";
import pluralize from "@/utils/functions/pluralize";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { useBulkDeleteTodos } from "./use-todos";

export function useBulkDeleteTodoConfirmModal(todoIds: string[]) {
  const { mutate: bulkDeleteTodos } = useBulkDeleteTodos();

  const { setIsSelectMode, setSelectedTaskIds } = useTaskSelectionContext();

  const numberOfIds = useMemo(() => {
    return todoIds.length;
  }, [todoIds]);

  return useConfirmModal({
    title: "Delete task?",
    description: (
      <div>
        <span className="font-bold">{numberOfIds}</span>{" "}
        {pluralize("tag", numberOfIds)} will be deleted
      </div>
    ),
    onConfirm() {
      bulkDeleteTodos({ todoIds });
      setIsSelectMode(false);
      setSelectedTaskIds([]);
    },
    variant: "destructive",
  });
}
