import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import { Check, MoreHorizontal } from "lucide-react";
import { useUpdateTodo } from "@/hooks/use-todos";
import { Popover } from "./ui/popover";
import { useState } from "react";
import MoreOptionsDropDown from "./MoreOptionsDropDown";

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
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

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
          "border border-border rounded-lg p-2.5 mb-2 w-[260px] min-h-[70px] bg-white shadow-2xs hover:shadow-card-hover hover:cursor-pointer relative group",
          className,
        )}
        ref={ref}
      >
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={<MoreOptionsDropDown />}
          sideOffset={2}
        >
          <div className="absolute top-2 right-2 hover:bg-accent rounded-sm data-[state=open]:bg-accent lg:hidden group-hover:block data-[state=open]:block">
            <MoreHorizontal color="#808080" />
          </div>
        </Popover>
        <div className="flex gap-2">
          <button
            className="border border-border rounded-full h-5 w-5 flex items-center justify-center group/check-mark cursor-pointer"
            onClick={() => {
              mutate({ id, data: { completed: !todo.completed } });
            }}
          >
            <Check size={15} className="hidden group-hover/check-mark:block" />
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
