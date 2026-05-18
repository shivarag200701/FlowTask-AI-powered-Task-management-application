import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { useOverDueTodos, useUpcomingTodos } from "@/hooks/use-todos";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { TodoWithCompleteAtDateTime } from "@/types";
import formatDate from "@/utils/functions/format-date";
import DroppableColumn from "@/components/DroppableColumn";
import { DragDropProvider } from "@dnd-kit/react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import DraggableTask from "@/components/DraggableTask";

function BoardView({ dateRange }: { dateRange: DateTime[] }) {
  const { data: overdueTodos } = useOverDueTodos();

  const { data: upcomingTodos } = useUpcomingTodos(dateRange);

  const [items, setItems] = useState<
    Record<string, TodoWithCompleteAtDateTime[]>
  >({});

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

  return (
    <>
      <div className="px-5 md:px-6 pt-5">
        <TaskDisplaySelector className="w-fit px-3 h-10" />
      </div>
      <PageWidthWrapper className="pt-6 px-3 flex flex-col overflow-x-auto scrollbar-none max-w-none">
        <div>
          <div className="flex gap-2 pt-3">
            <DragDropProvider>
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
            </DragDropProvider>
          </div>
        </div>
      </PageWidthWrapper>
    </>
  );
}

export default BoardView;
