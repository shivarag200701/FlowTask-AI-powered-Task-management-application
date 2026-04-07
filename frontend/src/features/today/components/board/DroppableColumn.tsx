import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";

function DroppableColumn({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: id,
    type: "column",
    accept: "item",
  });
  return (
    <div ref={ref} className={cn("p-3 h-[200px]", className)}>
      <div className="text-sm font-bold text-left">{id}</div>
      {children}
    </div>
  );
}

export default DroppableColumn;
