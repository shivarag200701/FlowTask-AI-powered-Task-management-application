import { Toolbar } from "@/components/ui/toolbar";
import { useTagSelectionContext } from "../TagSelectionContext";
import { CircleCheck, Trash, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Kbd } from "@/components/ui/kbd";
import { useBulkDeleteTagConfirmModal } from "../hooks/use-bulk-delete-tag-confirm-modal";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useTags } from "@/hooks/use-tags";
import pluralize from "@/utils/functions/pluralize";

function TagToolBar() {
  const { isSelectMode, setIsSelectMode, selectedTags, setSelectedTags } =
    useTagSelectionContext();
  const numberOfTagsSelected = useMemo(() => {
    return selectedTags?.length;
  }, [selectedTags]);

  const { ConfirmModal, setShowConfirmModal } =
    useBulkDeleteTagConfirmModal(selectedTags);

  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";

  const { data: tags } = useTags({ query: { search } });

  const tagCount = useMemo(() => {
    return tags?.length;
  }, [tags]);

  useEffect(() => {
    if (selectedTags?.length === 0) {
      setIsSelectMode(false);
    }
  }, [selectedTags]);

  return (
    <Toolbar>
      {isSelectMode ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-md hover:bg-accent/50 hover:cursor-pointer tranisition-colors duration-75"
              onClick={() => {
                setSelectedTags([]);
                setIsSelectMode(false);
              }}
            >
              <X className="size-4 text-neutral-900" />
            </button>
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">
              {numberOfTagsSelected} selected{" "}
            </span>
          </div>
          <button
            className="rounded-lg border whitespace-nowrap flex items-center justify-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer transition-all duration-75"
            onClick={() => {
              setShowConfirmModal(true);
            }}
          >
            <Trash className="size-3.5" />
            <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
              Delete
            </span>
            <Kbd>X</Kbd>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-neutral-600">
            Viewing 1-{tagCount} of {tagCount} {pluralize("tag", tagCount ?? 0)}
          </div>
          <div className="pt-3 sm:hidden">
            <Button
              variant="outline"
              icon={<CircleCheck className="size-4" strokeWidth={3} />}
              onClick={() => {
                setIsSelectMode(true);
              }}
            >
              Select
            </Button>
          </div>
        </div>
      )}
      {ConfirmModal}
    </Toolbar>
  );
}

export default TagToolBar;
