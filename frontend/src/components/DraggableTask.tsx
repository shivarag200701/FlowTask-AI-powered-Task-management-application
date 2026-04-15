import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import { Check } from "lucide-react";
import { useUpdateTodo } from "@/hooks/use-todos";

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
  const { mutate } = useUpdateTodo();
  const { ref, isDragging } = useSortable({
    id,
    index,
    transition: { duration: 200 },
    type: "item",
    accept: "item",
    group: column,
    data: todo,
  });

  if (isDragging) {
    return (
      <div
        ref={ref}
        className="w-[260px] min-h-[70px] mb-2 bg-accent rounded-lg"
      />
    );
  }
  return (
    <>
      <div
        className={cn(
          "border border-border rounded-lg p-2.5 mb-2 w-[260px] min-h-[70px] bg-white shadow-2xs hover:shadow-card-hover hover:cursor-pointer",
          className,
        )}
        ref={ref}
      >
        <div className="flex gap-2">
          <button
            className="border border-border rounded-full h-5 w-5 flex items-center justify-center group cursor-pointer"
            onClick={() => {
              mutate({ id, data: { completed: !todo.completed } });
            }}
          >
            <Check size={15} className="hidden group-hover:block" />
          </button>
          <div className="flex flex-col">
            <div className="text-md">{todo.title}</div>
            <div className="text-xs font-light">{todo.description}</div>
            <div className="text-xs">{todo.dueDate}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DraggableTask;
