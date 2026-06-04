import type { SectionWithDateTime, TodoWithCompleteAtDateTime } from "@/types";
import { DragOverlay } from "@dnd-kit/react";
import DraggableTask from "./DraggableTask";
import TimeDisplayer from "../TimeDisplayer";
import { AlarmClock } from "lucide-react";

function DragOverlayColumn({
  sections,
  noSectionTodos = [],
}: {
  sections: SectionWithDateTime[];
  noSectionTodos?: TodoWithCompleteAtDateTime[];
}) {
  return (
    <DragOverlay dropAnimation={null}>
      {(source) => {
        if (source.type === "column") {
          const section = sections.find((s) => s.id === source.id);
          if (!section) return null;

          return (
            <div className=" w-full min-h-[200px] border border-border rounded-lg shadow-[0_3px_5px_rgba(0.15,0.15,0.15,0.15)] bg-white p-2">
              <div className="text-left text-sm font-semibold w-full">
                {section.name}
              </div>
              <div className="p-2">
                {section.todos.map((todo, index) => (
                  <DraggableTask
                    column={section.id}
                    key={todo.id}
                    id={todo.id}
                    index={index}
                    todo={todo}
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          );
        }
        if (source.type === "item") {
          const allTodos = [
            ...noSectionTodos,
            ...sections.flatMap((s) => s.todos),
          ];
          const todo = allTodos.find((todo) => todo.id === source.id);
          if (!todo) return null;

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
                      <TimeDisplayer
                        className="text-xs"
                        dueTime={todo.dueTime}
                      />
                    )}
                    {todo.dueTime?.isValid && <AlarmClock size={13} />}
                  </div>
                </div>
              </div>
            </div>
          );
        }
      }}
    </DragOverlay>
  );
}

export default DragOverlayColumn;
