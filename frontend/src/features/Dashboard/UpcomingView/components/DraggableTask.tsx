import InlineTaskForm from "@/features/Dashboard/UpcomingView/components/InlineTaskForm";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type Todo, type TodoWithCompleteAtDateTime } from "@/types";
import api from "@/utils/api";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { MoreOptionsPicker } from "./MoreOptionsPicker";
import { Checkbox } from "@/features/ui/checkbox";
import { AlarmClock, Calendar, Repeat, Tag } from "lucide-react";

interface DraggableTaskProps {
  todo: TodoWithCompleteAtDateTime;
  index: number;
  columnIndex: number;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onOpenTaskDetail: (todo: Todo) => void;
  openDropdownId: number | string | null;
  setOpenDropdownId: (id: number | string | null) => void;
  playSound: () => void;
  onDuplicateTask: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
  todos: TodoWithCompleteAtDateTime[];
}

export const DraggableTask = ({
  todo,
  index,
  columnIndex,
  onToggleComplete,
  onDelete,
  onOpenTaskDetail,
  openDropdownId,
  setOpenDropdownId,
  playSound,
  onDuplicateTask,
  onTaskUpdated,
  todos,
}: DraggableTaskProps) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useSortable({
      id: todo.id || `temp-${index}`,
      data: {
        todo,
        columnIndex,
        type: "task",
      },
      animateLayoutChanges: () => false,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    userSelect: "none" as const,
  };

  // Check if todo.completeAt is for today (comparing local dates)
  const isToday = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();

    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate()
    );
  };

  const isTomorrow = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();
    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate() + 1
    );
  };

  const [isEditing, setIsEditing] = useState(false);
  const { isMobile } = useMediaQuery();
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (openDropdownId === todo.id) {
      suppressClickRef.current = true;
    } else if (suppressClickRef.current) {
      const timeout = setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [openDropdownId]);

  const handlePrioritySelect = (todo: Todo) => {
    // Optimistic update - update UI first
    onTaskUpdated(todo);
    setOpenDropdownId(null);

    api
      .put(`/v1/todo/${todo.id}`, {
        title: todo.title,
        description: todo.description,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring,
        recurrencePattern: todo.recurrencePattern ?? null,
        recurrenceInterval: todo.recurrenceInterval ?? null,
        recurrenceEndDate: todo.recurrenceEndDate ?? null,
        isAllDay: todo.isAllDay,
      })
      .catch((error) => {
        console.error("Error updating priority", error);
      });
  };
  const getTimeFromDate12hr = (date: string): string => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {isEditing ? (
        <InlineTaskForm todo={todo} />
      ) : (
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={`p-3 ${isDragging ? "bg-muted" : "bg-task"} 
            ${isDragging ? "h-[100px]" : ""} backdrop-blur-sm border group border-border hover:bg-gray-100 rounded-lg relative cursor-pointer active:cursor-grabbing shadow-md hover:shadow-[0_0_6px_-1px_rgba(0,0,0,0.3)] dark:hover:none hover:border-border-hover mb-3 `}
          onClick={(e) => {
            if (isMobile && suppressClickRef.current) return;
            e.preventDefault();
            onOpenTaskDetail(todo);
          }}
        >
          {!isDragging && (
            <>
              {todo.id && !isMobile && (
                <div
                  className={`absolute top-2 right-2 z-20 transition-opacity duration-200 pointer-events-auto opacity-0 group-hover:opacity-100 `}
                >
                  <MoreOptionsPicker
                    todoId={todo.id}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => onDelete(todo)}
                    onDuplicate={() => onDuplicateTask(todo)}
                    onPrioritySelect={(priority) => {
                      todo.priority = priority;
                      handlePrioritySelect(todo);
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3 pr-4">
                <div className="pt-0.5">
                  <Checkbox
                    className={` rounded-full cursor-pointer h-4.5 w-4.5 border-2 ${todo.priority === "high" ? "border-red-500" : todo.priority === "medium" ? "border-blue-500" : todo.priority === "low" ? "border-green-500" : "border-gray-500"}`}
                    defaultChecked={todo.completed}
                    onClick={(e) => {
                      e.stopPropagation();
                      todo.id && onToggleComplete(todo.id);
                      playSound();
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-sm font-medium mb-1 line-clamp-2">
                    {todo.title}
                  </div>
                  {todo.description && (
                    <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {todo.description}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {todo.category && (
                      <div className="mt-2 text-gray-500  w-fit  rounded-md text-xs flex gap-1">
                        <div className="flex justify-center items-center">
                          <Tag className="w-3 h-3" />
                        </div>
                        <div>{todo.category}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {!todo.isAllDay && (
                        <div
                          className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                        >
                          <div className="flex justify-center items-center">
                            <Calendar className="w-3 h-3" />
                          </div>
                          <div>
                            {getTimeFromDate12hr(todo.completeAt ?? "")}
                          </div>
                        </div>
                      )}
                      {todo.isRecurring && (
                        <div
                          className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                        >
                          <div className="flex justify-center items-center">
                            <Repeat className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {todo.reminder && (
                        <div className="mt-2 w-fit  rounded-md text-xs flex gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <div className="flex justify-center items-center">
                            <AlarmClock className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
