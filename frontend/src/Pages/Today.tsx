//needc to implement a overDue section
import { ModalContext } from "@/components/modals/ModalProvider";
import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { Button } from "@/components/ui/button";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import BoardView from "@/features/today/components/board/BoardView";
import ListView from "@/features/today/components/list/ListView";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { toast } from "sonner";

interface TodayProps {
  className?: string;
}

function Today({ className }: TodayProps) {
  const { viewMode } = useTaskDisplayContext();

  const { setShowDeleteTodoModal } = useContext(ModalContext);

  return (
    <div
      className={cn(
        `bg-neutral-200 w-full lg:py-2 lg:pr-2 hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`,
        className,
      )}
    >
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        <PageContentHeader title="Today" controls={<TaskDisplaySelector />} />
        <Button
          onClick={() => {
            setShowDeleteTodoModal(true);
          }}
        >
          Toast
        </Button>

        {viewMode === "list" && <ListView />}
        {viewMode === "board" && <BoardView />}
      </div>
    </div>
  );
}

export default Today;
