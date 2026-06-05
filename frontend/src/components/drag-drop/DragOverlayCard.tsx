import type { TodoWithCompleteAtDateTime } from "@/types";
import { DragOverlay } from "@dnd-kit/react";
import TimeDisplayer from "../TimeDisplayer";
import { AlarmClock } from "lucide-react";

function DragOverlayCard({ todos }: { todos: TodoWithCompleteAtDateTime[] }) {
  return (
    <DragOverlay dropAnimation={null}>
      {(source) => {
        const todo = todos.find((todo) => todo.id === source.id);
        if (!todo) {
          return null;
        }

        return (
          <div className="border border-border rounded-lg p-2.5 w-[260px] min-h-[70px] bg-white shadow-lg rotate-3 overflow-hidden">
            <div className="flex gap-2">
              <div className="border border-border rounded-full h-5 w-5 shrink-0" />
              <div className="flex flex-col">
                <div className="text-sm sm:text-[13px] truncate">
                  {todo.title}
                </div>
                <div className="text-xs font-light truncate">
                  {todo.description}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {todo.dueTime?.isValid && (
                    <TimeDisplayer className="text-xs" dueTime={todo.dueTime} />
                  )}
                  {todo.dueTime?.isValid && <AlarmClock size={13} />}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </DragOverlay>
  );
}

export default DragOverlayCard;
