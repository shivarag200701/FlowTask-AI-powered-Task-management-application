import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";

function DraggableTask({
  id,
  index,
  todo,
  column,
  className,
}: {
  id: number;
  index: number;
  todo: TodoWithCompleteAtDateTime;
  column: string;
  className?: string;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    transition: { duration: 200 },
    type: "item",
    accept: "item",
    group: column,
  });

  if (isDragging) {
    return (
      <div ref={ref} className="w-[260px] min-h-[70px] bg-accent rounded-lg" />
    );
  }
  return (
    <>
      <div
        className={cn(
          "border border-border rounded-lg p-2.5 w-[260px] min-h-[70px] bg-white shadow-xs hover:shadow-card-hover hover:cursor-pointer",
          className,
        )}
        ref={ref}
      >
        <div className="flex gap-2">
          <div className="border border-border rounded-full h-5 w-5" />
          <div className="flex flex-col">
            <div className="text-md">{todo.title}</div>
            <div className="text-xs font-light">{todo.description}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DraggableTask;
