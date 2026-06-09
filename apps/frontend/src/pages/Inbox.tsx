import TaskDisplaySelector from "@/features/projects/components/TaskDisplaySelector";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";
import { useInbox } from "@/hooks/use-projects";
import { useEffect, useState } from "react";
import type { ViewMode } from "@/types";
import ListView from "@/features/projects/components/list-view/ListView";
import BoardView from "@/features/projects/components/board-view/BoardView";
import { ProjectProvider } from "@/context/ProjectContext";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import { useMediaQuery } from "@/hooks/use-media-query";
import TaskToolBar from "@/components/TaskToolBar";

export default function Inbox({ className }: { className?: string }) {
  const { data: inbox } = useInbox();
  const { isSelectMode } = useTaskSelectionContext();
  const { isMobile } = useMediaQuery();

  const persisted = inbox?.taskDisplayPreferences?.viewMode ?? "list";

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (inbox?.taskDisplayPreferences?.viewMode) {
      setViewMode(inbox.taskDisplayPreferences.viewMode);
    }
  }, [inbox?.taskDisplayPreferences?.viewMode]);

  const isDirty = viewMode !== persisted;
  return (
    <div
      className={cn(className, "h-full ", {
        "overflow-hidden": viewMode === "board",
      })}
    >
      <PageContentHeader
        controls={
          <TaskDisplaySelector
            isDirty={isDirty}
            viewMode={viewMode}
            persisted={persisted}
            setViewMode={setViewMode}
            id={inbox?.id!}
            isInbox
          />
        }
      />
      <ProjectProvider id={inbox?.id!}>
        {viewMode === "list" && <ListView id={inbox?.id!} />}
        {viewMode === "board" && <BoardView />}
      </ProjectProvider>
      {(isSelectMode || isMobile) && <TaskToolBar />}
    </div>
  );
}
