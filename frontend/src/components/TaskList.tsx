import { useUpdateTodo } from "@/hooks/use-todos";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { AlarmClock, Check, MoreVertical } from "lucide-react";
import { useState } from "react";
import MoreOptionsDropDown from "./popovers/MoreOptionsDropDown";
import { Popover } from "./ui/popover";
import { cn } from "@/lib/utils";
import TimeDisplayer from "./TimeDisplayer";
import { useDeleteTodoConfirmModal } from "@/hooks/use-delete-todo-confirm-modal";
import completed from "@/assets/completed.mp3";
import { Button } from "./ui/button";

function TaskList({
  todo,
  className,
}: {
  todo: TodoWithCompleteAtDateTime;
  className?: string;
}) {
  const { mutate: updateTodo } = useUpdateTodo();
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const {
    setShowConfirmModal: setShowDeleteConfirmModal,
    confirmModal: DeleteConfirmModal,
  } = useDeleteTodoConfirmModal(todo);

  return (
    <div
      className={cn(
        "flex justify-between items-center  border-b border-border  px-4 py-2.5 min-h-15 hover:shadow-card-hover group cursor-pointer",
        className,
        { "shadow-card-hover": isMoreOptionsOpen },
      )}
    >
      <div className="flex gap-4 items-start justify-start">
        <button
          className="h-5 w-5 border border-border/50 rounded-full bg-linear-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 flex items-center justify-center group/circle"
          onClick={() => {
            new Audio(completed).play();
            updateTodo({ id: todo.id, data: { completed: !todo.completed } });
          }}
        >
          <Check size={15} className="group-hover/circle:block hidden" />
        </button>
        <div className="flex flex-col gap-[1.5px]">
          <div className="text-md">{todo.title}</div>
          <span className="text-[12px] font-light text-secondary-foreground">
            {todo.description}
          </span>
          <div className="flex items-center gap-2">
            {todo.dueTime?.isValid && (
              <TimeDisplayer className="text-xs" dueTime={todo.dueTime} />
            )}
            {todo.dueTime?.isValid && <AlarmClock size={13} />}
          </div>
        </div>
      </div>
      <Popover
        openPopover={isMoreOptionsOpen}
        setOpenPopover={setIsMoreOptionsOpen}
        content={
          <MoreOptionsDropDown
            onDelete={() => {
              setIsMoreOptionsOpen(false);
              setShowDeleteConfirmModal(true);
            }}
          />
        }
        sideOffset={5}
        side="bottom"
        align="end"
      >
        <Button
          variant="custom"
          className="w-fit"
          icon={<MoreVertical color="#808080" strokeWidth={2.5} />}
        />
      </Popover>
      {DeleteConfirmModal}
    </div>
  );
}

export default TaskList;
