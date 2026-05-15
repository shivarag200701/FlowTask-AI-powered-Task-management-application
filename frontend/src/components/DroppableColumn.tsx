import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { useState, type ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { CirclePlus } from "lucide-react";
import { Button } from "./ui/button";
import { useAddEditTodoModal } from "./modals/AddEditTodoModal";

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

  console.log("id", id);

  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const { setShowAddEditTodoModal, AddEditTodoModal } = useAddEditTodoModal();

  if (id === "Overdue" && numberofTodos === 0) {
    return null;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setAtBottom(
      e.currentTarget.scrollHeight - e.currentTarget.clientHeight - scrollTop <=
        1
    );

    if (scrollTop === 0) {
      setAtTop(true);
    } else {
      setAtTop(false);
    }
  };

  return (
    <div ref={ref} className={cn("p-1 w-[300px] h-[700px]", className)}>
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
            "border-b": !atBottom,
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
