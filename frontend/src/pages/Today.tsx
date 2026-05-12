import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import TaskToolBar from "@/components/TaskToolBar";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import BoardView from "@/features/today/components/board/BoardView";
import ListView from "@/features/today/components/list/ListView";
import { useMediaQuery } from "@/hooks/use-media-query";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";

interface TodayProps {
  className?: string;
}

function Today({ className }: TodayProps) {
  const { viewMode } = useTaskDisplayContext();
  const { isSelectMode } = useTaskSelectionContext();
  const { isMobile } = useMediaQuery();

  return (
    <div className={cn(className, "h-full")}>
      <PageContentHeader title="Today" controls={<TaskDisplaySelector />} />
      {viewMode === "list" && <ListView />}
      {viewMode === "board" && <BoardView />}
      {(isSelectMode || isMobile) && <TaskToolBar />}
    </div>
  );
}

export default Today;
