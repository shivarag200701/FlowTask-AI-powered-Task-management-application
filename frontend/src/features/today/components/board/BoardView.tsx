import { useTodayTodos } from "@/hooks/use-today-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useRef, useState } from "react";
import FormatDate from "@/utils/format-date";
import DroppableColumn from "../../../../components/DroppableColumn";
import DraggableTask from "@/components/DraggableTask";
import { DateTime } from "luxon";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { isSortable } from "@dnd-kit/react/sortable";
import { type UniqueIdentifier } from "@dnd-kit/abstract";

function BoardView() {
  const { data: todayTodos } = useTodayTodos();

  if (!todayTodos) return;
  const [items, setItems] = useState({
    [FormatDate(DateTime.now())]: todayTodos,
  });

  const snapshot = useRef(structuredClone(items));
  const dragInitialColumn = useRef<UniqueIdentifier | undefined>(undefined);

  return (
    <PageWidthWrapper className="pt-6 lg:pt-12 flex flex-col gap-6">
      <DragDropProvider
        onDragStart={() => {
          snapshot.current = structuredClone(items);
        }}
        onDragOver={(event) => {
          setItems((items) => move(items, event));
        }}
        onDragEnd={(event) => {
          if (event.canceled) {
            setItems(snapshot.current);
            return;
          }
          const { source } = event.operation;
          if (isSortable(source)) {
            const { group } = source;

            if (
              group === "Over Due" &&
              dragInitialColumn.current !== "Over Due"
            ) {
              setItems(snapshot.current);
              return;
            }

            setItems((items) => move(items, event));
          }
          setItems((item) => move(item, event));
          //todo, change the actual state after dragging
        }}
      >
        <div className="flex gap-10">
          {Object.entries(items).map(([column, items]) => (
            <DroppableColumn
              key={column}
              id={column}
              className="flex flex-col gap-2.5"
              numberofTodos={items.length}
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
        <Overlay todos={todayTodos} />
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

function Overlay({ todos }: { todos: TodoWithCompleteAtDateTime[] }) {
  return (
    <DragOverlay>
      {(source) => {
        const todo = todos.find((todo) => todo.id === source.id);
        if (!todo) {
          return null;
        }
        return (
          <div className="border border-border rounded-lg p-2.5 w-[260px] min-h-[70px] bg-white shadow-lg rotate-3">
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
  );
}

export default BoardView;
