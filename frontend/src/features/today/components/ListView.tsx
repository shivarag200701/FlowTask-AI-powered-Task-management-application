import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import EmptyState from "./EmptyState";
import { useTodayTodos } from "@/hooks/use-today-todos";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { MoreVertical } from "lucide-react";

function ListView() {
  const { data: todos } = useTodayTodos();
  return (
    <PageWidthWrapper className="grid gap-y-4 pt-6 lg:pt-12">
      {todos && todos.length != 0 ? (
        todos.map((todo) => <TaskList todo={todo} />)
      ) : (
        <EmptyState />
      )}
    </PageWidthWrapper>
  );
}

function TaskList({ todo }: { todo: TodoWithCompleteAtDateTime }) {
  return (
    <div className="flex justify-between items-center border rounded-xl border-border  px-4 py-2.5 h-20">
      <div className="flex gap-4 items-center justify-start">
        <div className="h-10 w-10 border border-border/50 rounded-full bg-gradient-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 " />
        <div className="flex flex-col gap-1">
          <h3 className="text-md font-semibold">{todo.title}</h3>
          <span className="text-xs">{todo.description}</span>
        </div>
      </div>
      <div>
        <MoreVertical size={20} />
      </div>
    </div>
  );
}

export default ListView;
