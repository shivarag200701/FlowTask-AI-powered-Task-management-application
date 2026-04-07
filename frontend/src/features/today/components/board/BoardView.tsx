import { useTodayTodos } from "@/hooks/use-today-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider } from "@dnd-kit/react";
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
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

export default BoardView;
