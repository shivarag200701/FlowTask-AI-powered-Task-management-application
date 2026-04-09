import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import EmptyState from "../EmptyState";
import { useTodayTodos } from "@/hooks/use-todos";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { MoreVertical } from "lucide-react";
import { DateTime } from "luxon";
import pluralize from "@/utils/pluralize";

function ListView() {
  const { data: todos } = useTodayTodos();
  return (
    <PageWidthWrapper className="grid gap-y-4 pt-6 lg:pt-1">
      {todos ? (
        <>
          <div className="overflow-y-auto hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {todos.length} {pluralize("task", todos.length)}
          </div>
          {todos.map((todo) => (
            <TaskList key={todo.id} todo={todo} />
          ))}
        </>
      ) : (
        <EmptyState />
      )}
    </PageWidthWrapper>
  );
}

function TaskList({ todo }: { todo: TodoWithCompleteAtDateTime }) {
  return (
    <div className="flex justify-between items-center border rounded-xl border-border  px-4 py-2.5 h-20 hover:shadow-card-hover group">
      <div className="flex gap-4 items-center justify-start">
        <div className="h-10 w-10 border border-border/50 rounded-full bg-gradient-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 " />
        <div className="flex flex-col gap-1">
          <h3 className="text-md font-semibold">{todo.title}</h3>
          <span className="text-xs">{todo.description}</span>
          <span className="text-xs">
            {todo.completeAt?.toLocaleString(DateTime.TIME_SIMPLE)}
          </span>
        </div>
      </div>
      <div className="group-hover:border group-hover:border-border rounded-md px-1.5 py-1 transition-all duration-50">
        <MoreVertical size={20} />
      </div>
    </div>
  );
}

export default ListView;
