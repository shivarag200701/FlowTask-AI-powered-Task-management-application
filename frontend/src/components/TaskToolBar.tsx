import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { Toolbar } from "./ui/toolbar";
import { useEffect, useMemo } from "react";
import { Calendar, CircleCheck, Tag, Trash, X } from "lucide-react";
import { Kbd } from "./ui/kbd";
import { useBulkDeleteTodoConfirmModal } from "@/hooks/use-bulk-delete-todo-confirm-modal";
import { useHotkeys } from "react-hotkeys-hook";
import { useTagTodoModal } from "./modals/TagTodoModal";
import { Button } from "./ui/button";
import { useAddEditTodoModal } from "./modals/AddEditTodoModal";
import { useMediaQuery } from "@/hooks/use-media-query";

function TaskToolBar() {
  const { selectedTaskIds, setSelectedTaskIds, setIsSelectMode, isSelectMode } =
    useTaskSelectionContext();

  const { ConfirmModal, setShowConfirmModal } =
    useBulkDeleteTodoConfirmModal(selectedTaskIds);

  const { TagTodoModal, setShowTagTodoModal } = useTagTodoModal();

  const { CreateTodoButton, AddEditTodoModal } = useAddEditTodoModal();
  const { isMobile } = useMediaQuery();

  const numberOfTaskSelected = useMemo(() => {
    return selectedTaskIds.length;
  }, [selectedTaskIds]);

  useEffect(() => {
    if (selectedTaskIds?.length === 0) {
      setIsSelectMode(false);
    }
  }, [selectedTaskIds]);

  useHotkeys("x", () => {
    setShowConfirmModal(true);
  });
  useHotkeys("t", () => {
    setShowTagTodoModal(true);
  });
  return (
    <Toolbar>
      {isSelectMode ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-md hover:bg-accent/50 hover:cursor-pointer tranisition-colors duration-75"
              onClick={() => {
                setSelectedTaskIds([]);
                setIsSelectMode(false);
              }}
            >
              <X className="size-4 text-neutral-900" />
            </button>
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">
              {numberOfTaskSelected} selected{" "}
            </span>
          </div>
          <div className=" flex items-center gap-2">
            <button
              className="rounded-lg border whitespace-nowrap flex items-center justify-center gap-2 px-2 py-1.5 sm:py-1 hover:bg-accent cursor-pointer transition-all duration-75"
              onClick={() => {
                setShowTagTodoModal(true);
              }}
            >
              <Tag className="size-3.5" />
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                    Tags
                  </span>
                  <Kbd>T</Kbd>
                </div>
              )}
            </button>
            <button className="rounded-lg border whitespace-nowrap flex items-center justify-center gap-2 px-2 py-1.5 sm:py-1 hover:bg-accent cursor-pointer transition-all duration-75">
              <Calendar className="size-3.5" />
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                    Date
                  </span>
                  <Kbd>D</Kbd>
                </div>
              )}
            </button>
            <button
              className="rounded-lg border whitespace-nowrap flex items-center justify-center gap-2 px-2 py-1.5 sm:py-1 hover:bg-accent cursor-pointer transition-all duration-75"
              onClick={() => {
                setShowConfirmModal(true);
              }}
            >
              <Trash className="size-3.5" />
              {!isMobile && (
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                    Delete
                  </span>
                  <Kbd>X</Kbd>
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="col-span-2">
            <CreateTodoButton />
          </div>
          <Button
            variant="outline"
            className="col-span-1"
            icon={<CircleCheck className="size-4" strokeWidth={3} />}
            onClick={() => {
              setIsSelectMode(true);
            }}
          >
            Select
          </Button>
        </div>
      )}
      {ConfirmModal}
      {TagTodoModal}
      <AddEditTodoModal />
    </Toolbar>
  );
}

export default TaskToolBar;
