import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import TaskToolBar from "@/components/TaskToolBar";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import BoardView from "@/features/today/components/board/BoardView";
import ListView from "@/features/today/components/list/ListView";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";

interface TodayProps {
  className?: string;
}

function Today({ className }: TodayProps) {
  const { viewMode } = useTaskDisplayContext();
  const { isSelectMode } = useTaskSelectionContext();

  console.log("select mode", isSelectMode);

  return (
    <div className={cn(className, "h-full")}>
      <PageContentHeader title="Today" controls={<TaskDisplaySelector />} />
      {viewMode === "list" && <ListView />}
      {viewMode === "board" && <BoardView />}
      {isSelectMode && <TaskToolBar />}
    </div>
  );
}

export default Today;
