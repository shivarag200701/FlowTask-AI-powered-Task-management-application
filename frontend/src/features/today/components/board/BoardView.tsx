import { useTodayTodos, useUpdateTodo } from "@/hooks/use-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState } from "react";
import FormatDate from "@/utils/functions/format-date";
import DroppableColumn from "@/components/drag-drop/DroppableColumn";
import DraggableTask from "@/components/drag-drop/DraggableTask";
import { DateTime } from "luxon";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { useOverDueTodos } from "@/hooks/use-todos";
import { isSortable } from "@dnd-kit/react/sortable";
import { type UniqueIdentifier } from "@dnd-kit/abstract";
import { SpinnerCustom } from "@/components/ui/spinner";
import type { UpdateTodo } from "@shiva200701/todotypes";
import EmptyState from "@/components/EmptyState";
import { useAddEditTodoModal } from "@/components/modals/AddEditTodoModal";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import DragOverlayCard from "@/components/drag-drop/DragOverlayCard";

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

  const { AddEditTodoModal, CreateTodoButton } = useAddEditTodoModal();
  const { setSelectedTaskIds, setIsSelectMode } = useTaskSelectionContext();

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

      if (group !== "Overdue") {
        const today = DateTime.now();

        payload.dueDate = today.toFormat("yyyy-MM-dd");

        if (data.dueTime) {
          payload.dueTime =
            data.dueTime
              ?.set({ year: today.year, month: today.month, day: today.day })
              .toUTC()
              .toISO() ?? null;
        }
      }

      if (group === dragInitialColumn.current) {
        mutate({ id: data.id, data: payload, type: "updateOrder" });
        return;
      }

      mutate({ id: data.id, data: payload, type: "updateDate" });
    }
  }

  return (
    <PageWidthWrapper className="pt-6 px-3 flex flex-col overflow-x-auto ">
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
          <div className="flex gap-10 px-3 w-max">
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
                    onSelect={(taskId) => {
                      setIsSelectMode(true);
                      setSelectedTaskIds((prev) => {
                        if (prev.includes(taskId))
                          return prev.filter((id) => id !== taskId);

                        return [...prev, taskId];
                      });
                    }}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>
          <DragOverlayCard todos={todos} />
        </DragDropProvider>
      ) : (
        <div>
          <EmptyState
            title="No todos yet"
            description="Start organizing your day with todos"
            addButton={<CreateTodoButton />}
          />
          <AddEditTodoModal />
        </div>
      )}
    </PageWidthWrapper>
  );
}

export default BoardView;
