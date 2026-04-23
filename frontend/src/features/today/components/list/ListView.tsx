import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import EmptyState from "../EmptyState";
import { useOverDueTodos, useTodayTodos } from "@/hooks/use-todos";
import { DateTime } from "luxon";
import formatDate from "@/utils/functions/format-date";
import OverDueListView from "@/components/OverDueListView";
import TaskList from "@/components/TaskList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import InlineTaskForm from "@/components/InlineTaskForm";
import TaskBuilderProvider from "@/components/task-builder-provider";

function ListView() {
  const { data: todos } = useTodayTodos();
  const { data: overdueTodos } = useOverDueTodos();
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);

  return (
    <PageWidthWrapper className="grid pt-6 lg:pt-1">
      {overdueTodos && <OverDueListView />}
      {todos && (
        <>
          <div className="overflow-y-auto hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mt-10 mb-5">
            <div className="flex gap-1 items-center font-bold">
              <div>{formatDate(DateTime.now())}</div>
              <div className="h-[2.5px] w-[2.5px] rounded-full bg-black" />
              <div>Today</div>
              <div className="h-[2.5px] w-[2.5px] rounded-full bg-black" />
              <div>{DateTime.now().weekdayLong}</div>
            </div>
          </div>
          {todos.map((todo) => (
            <TaskList key={todo.id} todo={todo} />
          ))}
          <div className="mt-5">
            {!isAddTodoOpen ? (
              <Button
                variant="outline"
                className="flex justify-start border-none shadow-none hover:text-primary"
                onClick={() => {
                  setIsAddTodoOpen(true);
                }}
              >
                <CirclePlus />
                Add Task
              </Button>
            ) : (
              <TaskBuilderProvider>
                <InlineTaskForm setIsOpen={setIsAddTodoOpen} todo={todos[0]} />
              </TaskBuilderProvider>
            )}
          </div>
        </>
      )}
      {!todos && !overdueTodos && <EmptyState />}
    </PageWidthWrapper>
  );
}

export default ListView;
