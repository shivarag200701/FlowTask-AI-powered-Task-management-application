import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import DraggableTask from "./DraggableTask";
import { CirclePlus } from "lucide-react";
import { Button } from "../ui/button";
import { useAddEditTodoModal } from "../modals/AddEditTodoModal";

function DraggableColumn({
  id,
  index,
  todos,
  column,
  projectId,
}: {
  id: string;
  index: number;
  todos: TodoWithCompleteAtDateTime[];
  column: string;
  projectId: string;
}) {
  const { setShowAddEditTodoModal, AddEditTodoModal } = useAddEditTodoModal({
    projectId,
    sectionId: id,
  });

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "column",
    accept: "column",
  });

  if (isDragging) {
    return (
      <div
        ref={ref}
        className="min-w-[260px] min-h-[200px] mb-2 bg-accent rounded-lg"
      />
    );
  }

  return (
    <div
      ref={ref}
      className="min-w-[260px] min-h-[200px] hover:shadow-[0_3px_5px_rgba(0.15,0.15,0.15,0.15)] duration-200 transition-all cursor-grab rounded-lg flex flex-col gap-1 items-center text-sm font-semibold  p-2"
    >
      <div className="text-left w-full">{column}</div>
      <div className="p-2">
        {todos.map((todo, index) => (
          <DraggableTask
            column={column}
            id={todo.id}
            index={index}
            todo={todo}
          />
        ))}
      </div>
      <Button
        className="flex gap-2 justify-start items-center w-full px-2 hover:bg-accent cursor-pointer rounded-md hover:text-primary group"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          setShowAddEditTodoModal(true);
        }}
      >
        <CirclePlus size={18} />
        <span className="font-light text-neutral-400 group-hover:text-primary">
          Add Task
        </span>
      </Button>
      <AddEditTodoModal />
    </div>
  );
}

export default DraggableColumn;
