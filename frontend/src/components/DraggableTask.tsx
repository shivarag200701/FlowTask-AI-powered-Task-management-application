import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import { AlarmClock, Check, MoreHorizontal } from "lucide-react";
import { useUpdateTodo } from "@/hooks/use-todos";
import { Popover } from "./ui/popover";
import { useMemo, useState } from "react";
import MoreOptionsDropDown from "./popovers/MoreTodoOptionsDropDown";
import { useDeleteTodoConfirmModal } from "@/hooks/use-delete-todo-confirm-modal";
import TimeDisplayer from "./TimeDisplayer";
import completed from "@/assets/completed.mp3";
import { useAddEditTodoModal } from "./modals/AddEditTodoModal";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { useMediaQuery } from "@/hooks/use-media-query";

function DraggableTask({
  id,
  index,
  todo,
  column,
  className,
  onSelect,
}: {
  id: string;
  index: number;
  todo: TodoWithCompleteAtDateTime;
  column: string;
  className?: string;
  onSelect?: (taskId: string) => void;
}) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const { mutate: updateTodo } = useUpdateTodo();
  const { selectedTaskIds } = useTaskSelectionContext();

  const { setShowAddEditTodoModal, AddEditTodoModal } =
    useAddEditTodoModal(todo);

  const {
    setShowConfirmModal: setShowDeleteConfirmModal,
    ConfirmModal: DeleteConfirmModal,
  } = useDeleteTodoConfirmModal(todo);

  const { ref, isDragging } = useSortable({
    id,
    index,
    transition: { duration: 200 },
    type: "item",
    accept: "item",
    group: column,
    data: todo,
  });

  const { isMobile } = useMediaQuery();
  const { isSelectMode } = useTaskSelectionContext();

  const taskSelected = useMemo(() => {
    return selectedTaskIds.includes(id);
  }, [selectedTaskIds]);

  if (isDragging) {
    return (
      <div
        ref={ref}
        className="w-[260px] min-h-[70px] mb-2 bg-accent rounded-lg"
      />
    );
  }
  return (
    <>
      <div
        className={cn(
          "border border-border rounded-lg py-1.5 px-3 mb-2 w-[260px] min-h-[70px] bg-white shadow-2xs hover:shadow-card-hover hover:cursor-pointer relative group select-none transition-all duration-200",
          className,
          taskSelected && "bg-accent"
        )}
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          if (e.shiftKey) {
            onSelect?.(id);
            return;
          } else if (isSelectMode && isMobile) {
            onSelect?.(id);
            return;
          }
        }}
      >
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={
            <MoreOptionsDropDown
              onDelete={() => {
                setIsMoreOptionsOpen(false);
                setShowDeleteConfirmModal(true);
              }}
              onEdit={() => {
                setIsMoreOptionsOpen(false);
                setShowAddEditTodoModal(true);
              }}
            />
          }
          sideOffset={2}
        >
          <div className="absolute top-2 right-2 hover:bg-accent rounded-sm data-[state=open]:bg-accent lg:hidden group-hover:block data-[state=open]:block">
            <MoreHorizontal color="#808080" />
          </div>
        </Popover>
        <div className="flex gap-2 select-none">
          <button
            className="h-5 w-5 border border-border/50 rounded-full bg-linear-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 flex items-center justify-center group/circle"
            onClick={() => {
              new Audio(completed).play();
              updateTodo({ id, data: { completed: !todo.completed } });
            }}
          >
            <Check size={15} className="hidden group-hover/circle:block" />
          </button>
          <div className="flex flex-col">
            <div className="text-sm">{todo.title}</div>
            <div className="text-xs font-light">{todo.description}</div>
            <div className="flex items-center gap-2 py-1 ">
              {todo.dueTime?.isValid && (
                <TimeDisplayer className="text-xs" dueTime={todo.dueTime} />
              )}
              {todo.dueTime?.isValid && <AlarmClock size={13} />}
            </div>
          </div>
        </div>
        {DeleteConfirmModal}
      </div>
      <AddEditTodoModal />
    </>
  );
}

export default DraggableTask;
