import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";

function DraggableTask({
  id,
  index,
  todo,
  column,
}: {
  id: number;
  index: number;
  todo: TodoWithCompleteAtDateTime;
  column: string;
}) {
  const { ref, targetRef, sourceRef } = useSortable({
    id,
    index,
    transition: { duration: 200 },
    type: "item",
    accept: "item",
  });

  return (
    <div
      className="border border-border rounded-lg p-2.5 w-[260px] h-[70px] bg-white hover:shadow-xs"
      ref={ref}
    >
      <div className="flex gap-2">
        <div className="border border-border rounded-full h-5 w-5" />
        <div className="flex flex-col gap-1">
          <div className="text-md">{todo.title}</div>
          <div className="text-xs font-light">{todo.description}</div>
        </div>
      </div>
    </div>
  );
}

export default DraggableTask;
