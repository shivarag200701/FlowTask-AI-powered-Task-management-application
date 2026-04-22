import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import BoardView from "@/features/today/components/board/BoardView";
import ListView from "@/features/today/components/list/ListView";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";

interface TodayProps {
  className?: string;
}

function Today({ className }: TodayProps) {
  const { viewMode } = useTaskDisplayContext();

  return (
    <div className={cn(className)}>
      <PageContentHeader title="Today" controls={<TaskDisplaySelector />} />
      {viewMode === "list" && <ListView />}
      {viewMode === "board" && <BoardView />}
    </div>
  );
}

export default Today;
