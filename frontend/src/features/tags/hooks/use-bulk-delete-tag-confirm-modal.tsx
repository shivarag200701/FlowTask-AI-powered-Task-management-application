import { useConfirmModal } from "@/components/modals/ConfirmModal";
import { useMemo } from "react";
import pluralize from "@/utils/functions/pluralize";
import { useBulkDeleteTags } from "@/hooks/use-tags";
import { useTagSelectionContext } from "../TagSelectionContext";

export function useBulkDeleteTagConfirmModal(tagIds: string[]) {
  const { mutate: bulkDeleteTags } = useBulkDeleteTags();

  const { setIsSelectMode, setSelectedTags } = useTagSelectionContext();

  const numberOfIds = useMemo(() => {
    return tagIds.length;
  }, [tagIds]);

  return useConfirmModal({
    title: "Delete task?",
    description: (
      <div>
        <span className="font-bold">{numberOfIds}</span>{" "}
        {pluralize("tag", numberOfIds)} will be deleted
      </div>
    ),
    onConfirm() {
      bulkDeleteTags({ tagIds });
      setIsSelectMode(false);
      setSelectedTags([]);
    },
    variant: "destructive",
  });
}
