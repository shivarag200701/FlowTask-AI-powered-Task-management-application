import { useTodayTodos } from "@/hooks/use-today-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useDroppable, DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useSortable } from "@dnd-kit/react/sortable";
import { useState, type ReactNode } from "react";
import currentDay from "@/utils/current-day";

function BoardView() {
  const { data: todos } = useTodayTodos();
  if (!todos) return;
  const [items, setItems] = useState({
    [currentDay()]: todos,
  });

  console.log("items", items);

  return (
    <PageWidthWrapper className="pt-6 lg:pt-12 flex flex-col gap-6">
      <DragDropProvider
        onDragOver={(event) => {
          setItems((items) => move(items, event));
        }}
      >
        <div className="flex gap-5">
          {Object.entries(items).map(([column, items]) => (
            <DateColumn key={column} id={column}>
              {items.map((todo, index) => (
                <Sortable
                  key={todo.id}
                  id={todo.id}
                  index={index}
                  column={column}
                  todo={todo}
                />
              ))}
            </DateColumn>
          ))}
        </div>
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

function Sortable({
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
    // group: column,
  });

  // console.log("I am the target for drop", id, isDropTarget);

  return (
    <div
      className="border border-border rounded-md px-2 py-1 max-w-[200px]"
      ref={ref}
    >
      {todo.title}
    </div>
  );
}

function DateColumn({ id, children }: { id: string; children: ReactNode }) {
  const { ref, isDropTarget } = useDroppable({
    id: id,
    type: "column",
    accept: "item",
  });
  return (
    <div ref={ref} className="p-3 border border-border h-[200px]">
      <div className="text-xs text-left">{id}</div>
      {children}
    </div>
  );
}

export default BoardView;
