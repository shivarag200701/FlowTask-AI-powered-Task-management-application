import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";

function DroppableColumn({
  id,
  children,
  className,
  numberofTodos,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  numberofTodos: number;
}) {
  const { ref } = useDroppable({
    id: id,
    type: "column",
    accept: ["item", "overdue-item"],
    collisionPriority: CollisionPriority.Low,
  });

  if (numberofTodos === 0) {
    return null;
  }

  return (
    <div ref={ref} className={cn("p-1 w-[280px] h-[500px] ", className)}>
      <div className="text-sm font-bold text-left flex items-center gap-1">
        <span>{id}</span>
        <div className="h-[3px] w-[3px] bg-black rounded-full" />
        <div>{numberofTodos}</div>
      </div>
      <div className="scrollbar-none overflow-x-hidden overflow-y-auto hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex flex-col ">
        {children}
      </div>
    </div>
  );
}

export default DroppableColumn;
