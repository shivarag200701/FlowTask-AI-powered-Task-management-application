import { useUpdateTodo } from "@/hooks/use-todos";
import type { TodoTag, TodoWithCompleteAtDateTime } from "@/types";
import { AlarmClock, Check, MoreVertical } from "lucide-react";
import { useContext, useMemo, useState, type ReactNode } from "react";
import MoreOptionsTodoDropDown from "./popovers/MoreTodoOptionsDropDown";
import { Popover } from "./ui/popover";
import { cn } from "@/lib/utils";
import TimeDisplayer from "./TimeDisplayer";
import { useDeleteTodoConfirmModal } from "@/hooks/use-delete-todo-confirm-modal";
import completed from "@/assets/completed.mp3";
import { Button } from "./ui/button";
import TagBadge from "./TagBadge";
import { Tooltip, TooltipContent } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { ModalContext } from "./modals/ModalProvider";
import { useMediaQuery } from "@/hooks/use-media-query";

function TaskList({
  todo,
  className,
  onSelect,
  compact = false,
  onClick,
  taskCompleted = false,
  projectId,
}: {
  todo: TodoWithCompleteAtDateTime;
  className?: string;
  onSelect?: (todoId: string) => void;
  compact?: boolean;
  onClick?: () => void;
  taskCompleted?: boolean;
  projectId?: string;
}) {
  const { mutate: updateTodo } = useUpdateTodo(projectId);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const { selectedTaskIds, isSelectMode } = useTaskSelectionContext();

  const todoSelected = useMemo(() => {
    return selectedTaskIds.includes(todo.id);
  }, [selectedTaskIds]);

  const {
    setShowConfirmModal: setShowDeleteConfirmModal,
    ConfirmModal: DeleteConfirmModal,
  } = useDeleteTodoConfirmModal(todo);

  const { openTodoDetailModal } = useContext(ModalContext);

  const { tags } = todo;
  const { isMobile } = useMediaQuery();

  const { primaryTag, secondaryTag } = useMemo(() => {
    //implement sorting of tags  suppose a filter is applied in the url to make that as the primary tag
    return { primaryTag: tags?.[0], secondaryTag: tags?.slice(1) };
  }, []);

  return (
    <div
      className={cn(
        "flex justify-between items-center  border-b border-border  px-4 py-2.5 min-h-15 hover:shadow-xs group cursor-pointer select-none transition-all duration-200",
        compact && "hover:shadow-none min-h-10",
        todoSelected && "bg-accent",
        className,
        { "shadow-card-hover": isMoreOptionsOpen }
      )}
      onClick={(e) => {
        e.preventDefault();
        if (e.shiftKey) {
          onSelect?.(todo.id);
          return;
        } else if (isSelectMode && isMobile) {
          onSelect?.(todo.id);
          return;
        }
        if (onClick) {
          onClick();
        } else {
          openTodoDetailModal(todo);
        }
      }}
    >
      <div className="flex gap-4 items-start justify-start">
        <button
          type="button"
          className={cn(
            "h-5 w-5 border border-border/50 shrink-0 rounded-full bg-linear-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 flex items-center justify-center group/circle",
            taskCompleted && "opacity-50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            new Audio(completed).play();
            updateTodo({ id: todo.id, data: { completed: !todo.completed } });
          }}
        >
          {taskCompleted ? (
            <Check size={15} />
          ) : (
            <Check size={15} className="group-hover/circle:block hidden" />
          )}
        </button>
        <div className="flex flex-col gap-[1.5px]">
          <div
            className={`text-sm  ${compact ? "font-normal" : "font-semibold"} ${taskCompleted && "line-through opacity-50"}`}
          >
            {todo.title}
          </div>
          {!compact && (
            <span className="text-sm font-light text-secondary-foreground">
              {todo.description}
            </span>
          )}
          <div className="flex items-center gap-2">
            {todo.dueTime?.isValid && (
              <TimeDisplayer className="text-xs" dueTime={todo.dueTime} />
            )}
            {todo.dueTime?.isValid && <AlarmClock size={13} />}
          </div>
        </div>
      </div>
      <div className="flex gap-1 sm:gap-10">
        {primaryTag !== undefined && !compact && (
          <TagsToolTip secondaryTags={secondaryTag ?? []}>
            <TagBadge
              color={primaryTag?.color ?? "blue"}
              withIcon
              name={primaryTag?.name}
              plus={secondaryTag?.length}
            />
          </TagsToolTip>
        )}
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={
            <MoreOptionsTodoDropDown
              onDelete={() => {
                setIsMoreOptionsOpen(false);
                setShowDeleteConfirmModal(true);
              }}
              //todo need to implement
              onEdit={() => {
                setIsMoreOptionsOpen(false);
                openTodoDetailModal(todo);
              }}
            />
          }
          sideOffset={5}
          side="bottom"
          align="end"
        >
          {!compact && (
            <Button
              variant="custom"
              className="w-fit"
              icon={<MoreVertical color="#808080" strokeWidth={2.5} />}
              size="icon-sm"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Popover>
      </div>
      {DeleteConfirmModal}
    </div>
  );
}

function TagsToolTip({
  secondaryTags,
  children,
}: {
  secondaryTags: TodoTag[];
  children: ReactNode;
}) {
  return (
    <div>
      {!!secondaryTags.length ? (
        <Tooltip>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent sideOffset={8}>
            <div className="flex gap-1">
              {secondaryTags.map((tag) => (
                <TagBadge color={tag.color} name={tag.name} withIcon />
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
}

export default TaskList;
