import {
  useOverDueTodos,
  useUpcomingTodos,
  useUpdateTodo,
} from "@/hooks/use-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { TodoWithCompleteAtDateTime } from "@/types";
import formatDate from "@/utils/functions/format-date";
import DroppableColumn from "@/components/drag-drop/DroppableColumn";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { type UniqueIdentifier } from "@dnd-kit/abstract";
import { DateTime } from "luxon";
import { useEffect, useRef, useState, useCallback } from "react";
import DraggableTask from "@/components/drag-drop/DraggableTask";
import { SpinnerCustom } from "@/components/ui/spinner";
import DragOverlayCard from "@/components/drag-drop/DragOverlayCard";
import { isSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type { UpdateTodo } from "@shiva200701/todotypes";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";

type DragEndPayload = DragEndEvent;

function BoardView({ dateRange }: { dateRange: DateTime[] }) {
  const { data: overdueTodos } = useOverDueTodos();

  const { data: upcomingTodos } = useUpcomingTodos(dateRange);
  const { mutate } = useUpdateTodo();
  const { setIsSelectMode, setSelectedTaskIds } = useTaskSelectionContext();

  const handleSelect = useCallback(
    (todoId: string) => {
      setIsSelectMode(true);
      setSelectedTaskIds((prev) => {
        if (prev.includes(todoId)) {
          return prev.filter((id) => id !== todoId);
        }
        return [...prev, todoId];
      });
    },
    [setIsSelectMode, setSelectedTaskIds]
  );

  const [items, setItems] = useState<
    Record<string, TodoWithCompleteAtDateTime[]>
  >({});

  const snapshot = useRef(structuredClone(items));
  const dragInitialColumn = useRef<UniqueIdentifier | undefined>(undefined);

  useEffect(() => {
    if (!overdueTodos || !upcomingTodos) return;
    const grouped: Record<string, TodoWithCompleteAtDateTime[]> = {
      Overdue: overdueTodos,
    };

    for (const date of dateRange) {
      grouped[formatDate(date)] = [];
    }

    for (const todo of upcomingTodos) {
      const key = formatDate(todo.dueDate!);
      if (grouped[key]) grouped[key].push(todo);
    }

    setItems(grouped);
  }, [dateRange, upcomingTodos]);

  if (overdueTodos == null || upcomingTodos == null) return <SpinnerCustom />;

  const todos = [...overdueTodos, ...upcomingTodos];

  async function handleDragEnd(event: DragEndPayload) {
    if (event.canceled) {
      setItems(snapshot.current);
      return;
    }

    const { source } = event.operation;
    const data = source?.data as TodoWithCompleteAtDateTime;
    if (source && isSortable(source)) {
      const { index, group } = source;

      if (group === "Overdue" && dragInitialColumn.current !== "Overdue") {
        setItems(snapshot.current);
        return;
      }

      const newItems = move(items, event);
      setItems(newItems);
      const column = newItems[group as string];

      const prevIndex = column[(index as number) - 1]?.sortKey ?? null;
      const nextIndex = column[(index as number) + 1]?.sortKey ?? null;

      const payload: UpdateTodo = { prevIndex, nextIndex };

      const targetDate = DateTime.fromFormat(group as string, "MMM d");

      payload.dueDate = targetDate.toFormat("yyyy-MM-dd");

      if (data.dueTime) {
        payload.dueTime =
          data.dueTime
            ?.set({
              year: targetDate.year,
              month: targetDate.month,
              day: targetDate.day,
            })
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
    <>
      <PageWidthWrapper className="pt-6 px-3 flex flex-col overflow-x-auto scrollbar-none max-w-none">
        <div>
          <div className="flex gap-2 pt-3">
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
              {Object.entries(items).map(([column, items]) => (
                <DroppableColumn
                  key={column}
                  id={column}
                  className="flex flex-col gap-2.5"
                  numberofTodos={items.length}
                  dateLabel={
                    DateTime.fromFormat(column, "MMM d").weekdayLong ?? column
                  }
                >
                  {items.map((todo, index) => (
                    <DraggableTask
                      key={todo.id}
                      id={todo.id}
                      index={index}
                      column={column}
                      todo={todo}
                      onSelect={handleSelect}
                    />
                  ))}
                </DroppableColumn>
              ))}
              <DragOverlayCard todos={todos} />
            </DragDropProvider>
          </div>
        </div>
      </PageWidthWrapper>
    </>
  );
}

export default BoardView;
