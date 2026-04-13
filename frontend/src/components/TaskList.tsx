import type { TodoWithCompleteAtDateTime } from "@/types";
import { MoreVertical } from "lucide-react";

function TaskList({ todo }: { todo: TodoWithCompleteAtDateTime }) {
  return (
    <div className="flex justify-between items-center first:border-none border-t last:border-b  border-border  px-4 py-2.5 h-15 hover:shadow-card-hover group cursor-pointer">
      <div className="flex gap-4 items-start justify-start">
        <div className="h-5 w-5 border border-border/50 rounded-full bg-gradient-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30" />
        <div className="flex flex-col gap-1">
          <h3 className="text-md font-semibold">{todo.title}</h3>
          <span className="text-xs">{todo.description}</span>
        </div>
      </div>
      <div className="hidden group-hover:block hover:border hover:border-border rounded-md px-1.5 py-1 transition-all duration-50">
        <MoreVertical size={20} />
      </div>
    </div>
  );
}

export default TaskList;
