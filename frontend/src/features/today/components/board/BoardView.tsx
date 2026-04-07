import { useTodayTodos } from "@/hooks/use-today-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useState } from "react";
import FormatDate from "@/utils/format-date";
import DroppableColumn from "./DroppableColumn";
import { Feedback } from "@dnd-kit/dom";
import DraggableTask from "@/components/DraggableTask";
import { DateTime } from "luxon";

function BoardView() {
  const { data: todos } = useTodayTodos();
  if (!todos) return;
  const [items, setItems] = useState({
    [FormatDate(DateTime.now())]: todos,
  });

  return (
    <PageWidthWrapper className="pt-6 lg:pt-12 flex flex-col gap-6">
      <DragDropProvider
        onDragOver={(event) => {
          setItems((items) => move(items, event));
        }}
        plugins={(defaults) =>
          defaults.map((plugin) =>
            plugin === Feedback
              ? Feedback.configure({ dropAnimation: null })
              : plugin,
          )
        }
      >
        <div className="flex gap-5">
          {Object.entries(items).map(([column, items]) => (
            <DroppableColumn
              key={column}
              id={column}
              className="flex flex-col gap-2.5"
            >
              {items.map((todo, index) => (
                <DraggableTask
                  key={todo.id}
                  id={todo.id}
                  index={index}
                  column={column}
                  todo={todo}
                />
              ))}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay>
          {(source) => {
            const todo = todos.find((todo) => todo.id === source.id);
            if (!todo) return null;

            return (
              <div className="border border-border rounded-lg p-2.5 w-[260px] h-[70px] bg-white shadow-lg rotate-3">
                <div className="flex gap-2">
                  <div className="border border-border rounded-full h-5 w-5" />
                  <div className="flex flex-col">
                    <div className="text-md">{todo.title}</div>
                    <div className="text-xs font-light">{todo.description}</div>
                  </div>
                </div>
              </div>
            );
          }}
        </DragOverlay>
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

export default BoardView;
