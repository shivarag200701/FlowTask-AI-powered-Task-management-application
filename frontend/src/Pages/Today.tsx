//needc to implement a overDue section
import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import BoardView from "@/features/today/components/BoardView";
import ListView from "@/features/today/components/ListView";
import { useTodayTodos } from "@/hooks/use-today-todos";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";

interface TodayProps {
  className?: string;
}

function Today({ className }: TodayProps) {
  const { viewMode } = useTaskDisplayContext();

  return (
    <div className={cn(`bg-neutral-200 w-full lg:py-2 lg:pr-2`, className)}>
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        <PageContentHeader title="Today" controls={<TaskDisplaySelector />} />
        {viewMode === "list" && <ListView />}
        {viewMode === "board" && <BoardView />}
      </div>
    </div>
  );
}

export default Today;
