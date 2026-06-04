import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  AlarmClock,
  Check,
  Hash,
  MoreHorizontal,
  Workflow,
} from "lucide-react";
import { useUpdateTodo } from "@/hooks/use-todos";
import { Popover } from "@/components/ui/popover";
import { useContext, useMemo, useState } from "react";
import MoreOptionsDropDown from "@/components/popovers/MoreTodoOptionsDropDown";
import { useDeleteTodoConfirmModal } from "@/hooks/use-delete-todo-confirm-modal";
import TimeDisplayer from "@/components/TimeDisplayer";
import completed from "@/assets/completed.mp3";
import { ModalContext } from "@/components/modals/ModalProvider";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProject } from "@/hooks/use-projects";

function DraggableTask({
  id,
  index,
  todo,
  column,
  className,
  onSelect,
  draggable = true,
}: {
  id: string;
  index: number;
  todo: TodoWithCompleteAtDateTime;
  column: string;
  className?: string;
  onSelect?: (taskId: string) => void;
  draggable?: boolean;
}) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const { mutate: updateTodo } = useUpdateTodo();
  const { selectedTaskIds } = useTaskSelectionContext();

  const { data: project } = useProject(todo.projectId ?? "");

  const { openTodoDetailModal } = useContext(ModalContext);

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

  const subTaskCompleted = useMemo(() => {
    return todo?.children?.filter((child) => child.completed).length;
  }, [todo]);

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
          "border border-border rounded-lg py-1.5 px-3 mb-2 w-[260px] min-h-[70px] max-h-[90px] bg-white shadow-2xs hover:shadow-card-hover hover:cursor-pointer relative group select-none transition-all duration-200",
          className,
          taskSelected && "bg-accent"
        )}
        ref={draggable ? ref : null}
        onClick={(e) => {
          e.preventDefault();
          if (e.shiftKey) {
            onSelect?.(id);
            return;
          } else if (isSelectMode && isMobile) {
            onSelect?.(id);
            return;
          }
          openTodoDetailModal(todo);
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
                openTodoDetailModal(todo);
              }}
            />
          }
          sideOffset={2}
        >
          <div
            className="absolute top-2 right-2 hover:bg-accent rounded-sm data-[state=open]:bg-accent lg:hidden group-hover:block data-[state=open]:block"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal color="#808080" />
          </div>
        </Popover>
        <div className="flex gap-2 select-none h-full overflow-hidden">
          <button
            className="h-5 w-5 shrink-0  border border-border/50 rounded-full bg-linear-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 flex items-center justify-center group/circle"
            onClick={(e) => {
              e.stopPropagation();
              new Audio(completed).play();
              updateTodo({ id, data: { completed: !todo.completed } });
            }}
          >
            <Check size={15} className="hidden group-hover/circle:block" />
          </button>
          <div className="flex flex-col justify-between w-full h-full">
            <div>
              <div className="text-sm font-medium sm:text-[13px] truncate ">
                {todo.title}
              </div>
              <div className="text-xs font-light truncate">
                {todo.description}
              </div>
            </div>
            <div className="flex items-center gap-2 py-1 ">
              {todo.children && todo.children.length > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Workflow size={16} strokeWidth={1} />
                  <span className="text-xs text-neutral-500">{`${subTaskCompleted} / ${todo.children.length}`}</span>
                </div>
              )}
              {todo.projectId && (
                <div className="flex items-center gap-0.5">
                  <Hash size={12} strokeWidth={1} />
                  <span className="text-[12px] font-extralight">
                    {project?.name}
                  </span>
                </div>
              )}
              {todo.dueTime?.isValid && (
                <TimeDisplayer
                  className="text-xs font-light"
                  dueTime={todo.dueTime}
                />
              )}
              {todo.dueTime?.isValid && <AlarmClock size={13} />}
            </div>
          </div>
        </div>
        {DeleteConfirmModal}
      </div>
    </>
  );
}

export default DraggableTask;
