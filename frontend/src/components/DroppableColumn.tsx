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
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <div
      ref={ref}
      className={cn(
        "p-3 h-[500px] overflow-y-auto custom-scrollbar",
        className,
      )}
    >
      <div className="text-sm font-bold text-left">
        {id} . {numberofTodos}
      </div>
      {children}
    </div>
  );
}

export default DroppableColumn;
