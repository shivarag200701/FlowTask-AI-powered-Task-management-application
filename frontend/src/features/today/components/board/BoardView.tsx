import { useTodayTodos, useUpdateTodo } from "@/hooks/use-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState } from "react";
import FormatDate from "@/utils/functions/format-date";
import DroppableColumn from "@/components/DroppableColumn";
import DraggableTask from "@/components/DraggableTask";
import { DateTime } from "luxon";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useOverDueTodos } from "@/hooks/use-todos";
import { isSortable } from "@dnd-kit/react/sortable";
import { type UniqueIdentifier } from "@dnd-kit/abstract";
import { SpinnerCustom } from "@/components/ui/spinner";
import EmptyState from "@/features/today/components/EmptyState";
import type { UpdateTodo } from "@shiva200701/todotypes";
import TimeDisplayer from "@/components/TimeDisplayer";
import { AlarmClock } from "lucide-react";

type DragEndPayload = DragEndEvent;

function BoardView() {
  const { data: todayTodos } = useTodayTodos();
  const { data: overdueTodos } = useOverDueTodos();
  const { mutate } = useUpdateTodo();

  const [items, setItems] = useState<
    Record<string, TodoWithCompleteAtDateTime[]>
  >({
    Overdue: [],
    [FormatDate(DateTime.now())]: [],
  });

  const snapshot = useRef(structuredClone(items));
  const dragInitialColumn = useRef<UniqueIdentifier | undefined>(undefined);

  useEffect(() => {
    if (!todayTodos || !overdueTodos) return;
    setItems(() => {
      return {
        Overdue: overdueTodos,
        [FormatDate(DateTime.now())]: todayTodos,
      };
    });
  }, [todayTodos, overdueTodos]);

  if (todayTodos == null || overdueTodos == null) return <SpinnerCustom />;

  const todos = [...todayTodos, ...overdueTodos];

  async function handleDragEnd(event: DragEndPayload) {
    if (event.canceled) {
      setItems(snapshot.current);
      return;
    }
    const { source } = event.operation;
    const data = source?.data as TodoWithCompleteAtDateTime;
    if (source && isSortable(source)) {
      const { group, index } = source;

      if (group === "Overdue" && dragInitialColumn.current !== "Overdue") {
        setItems(snapshot.current);
        return;
      }

      const newItems = move(items, event);
      setItems(newItems);

      const column = newItems[group as string] ?? [];

      const prevIndex = column[(index as number) - 1]?.sortKey ?? null;
      const nextIndex = column[(index as number) + 1]?.sortKey ?? null;

      const payload: UpdateTodo = { prevIndex, nextIndex };

      const today = DateTime.now();

      payload.dueDate = DateTime.now().toFormat("yyyy-MM-dd");

      if (data.dueTime) {
        payload.dueTime =
          data.dueTime
            ?.set({ year: today.year, month: today.month, day: today.day })
            .toUTC()
            .toISO() ?? null;
      }

      if (group === dragInitialColumn.current) {
        mutate({ id: data.id, data: payload, type: "updateOrder" });
        return;
      }

      mutate({ id: data.id, data: payload, type: "updateDate" });
    }
  }

  return (
    <PageWidthWrapper className="pt-6 lg:pt-12 flex flex-col gap-6">
      {todos.length > 0 ? (
        <DragDropProvider
          onDragStart={(event) => {
            snapshot.current = structuredClone(items);
            if (isSortable(event.operation.source)) {
              const { initialGroup } = event.operation.source;
              dragInitialColumn.current = initialGroup;
            }
          }}
          onDragOver={(event) => {
            setItems((items) => move(items, event));
          }}
          onDragEnd={(event) => {
            handleDragEnd(event);
          }}
        >
          <div className="flex gap-10">
            {Object.entries(items).map(([column, items]) => (
              <DroppableColumn
                key={column}
                id={column}
                className="flex flex-col gap-2.5"
                numberofTodos={items.length}
                dateLabel="Today"
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
          <Overlay todos={todos} />
        </DragDropProvider>
      ) : (
        <EmptyState />
      )}
    </PageWidthWrapper>
  );
}

function Overlay({ todos }: { todos: TodoWithCompleteAtDateTime[] }) {
  return (
    <DragOverlay dropAnimation={null}>
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

export default BoardView;
