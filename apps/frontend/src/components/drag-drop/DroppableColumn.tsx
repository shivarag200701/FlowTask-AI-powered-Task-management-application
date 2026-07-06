import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { type ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddEditTodoModal } from "@/components/modals/AddEditTodoModal";
import { useScrollBoundary } from "@/utils/functions/use-scroll-boundary";
import { DateTime } from "luxon";

function DroppableColumn({
  id,
  children,
  className,
  numberofTodos,
  dateLabel,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  numberofTodos: number;
  dateLabel: string;
}) {
  const { ref } = useDroppable({
    id: id,
    type: "column",
    accept: ["item", "overdue-item"],
    collisionPriority: CollisionPriority.Low,
  });

  const { setShowAddEditTodoModal, AddEditTodoModal } = useAddEditTodoModal({
    date: DateTime.fromFormat(id, "MMM d"),
  });

  const { atBottom, atTop, handleScroll } = useScrollBoundary();

  if (id === "Overdue" && numberofTodos === 0) {
    return null;
  }

  return (
    <div ref={ref} className={cn("p-1 min-w-[300px] h-[700px]", className)}>
      <div className="text-sm font-bold text-left flex items-center gap-1">
        <span>{id}</span>
        {id !== "Overdue" && (
          <div className="flex items-center gap-1">
            <div className="h-[2.5px] w-[2.5px] bg-black rounded-full" />
            <div>{dateLabel}</div>
          </div>
        )}
        <div className="font-light text-xs text-neutral-500 pl-2">
          {numberofTodos}
        </div>
      </div>
      <div
        className={cn(
          "scrollbar-none overflow-x-hidden overflow-y-auto scrollbar-thin hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex flex-col items-center  transition-all duration-50",
          {
            "border-t": !atTop,
            "border-b ": !atBottom,
          }
        )}
        onScroll={handleScroll}
      >
        {children}
      </div>
      {id !== "Overdue" && (
        <Button
          variant="outline"
          className="flex justify-start border-none shadow-none hover:text-primary gap-2"
          onClick={() => {
            setShowAddEditTodoModal(true);
          }}
        >
          <CirclePlus />
          Add Task
        </Button>
      )}
      <AddEditTodoModal />
    </div>
  );
}

export default DroppableColumn;
