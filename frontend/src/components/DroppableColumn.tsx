import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";

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

  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  if (numberofTodos === 0) {
    return null;
  }

  console.log("top", atTop);
  console.log("bottom", atBottom);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setAtBottom(
      e.currentTarget.scrollHeight - e.currentTarget.clientHeight - scrollTop <=
        1,
    );

    if (scrollTop === 0) {
      setAtTop(true);
    } else {
      setAtTop(false);
    }
  };

  return (
    <div ref={ref} className={cn("p-1 w-[300px] h-[500px]", className)}>
      <div className="text-sm font-bold text-left flex items-center gap-1">
        <span>{id}</span>
        {id !== "Overdue" && (
          <div>
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
          "scrollbar-none overflow-x-hidden overflow-y-auto scrollbar-w-2 hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex flex-col items-center justify-center transition-all duration-50",
          {
            "border-t": !atTop,
            "border-b": !atBottom,
          },
        )}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  );
}

export default DroppableColumn;
