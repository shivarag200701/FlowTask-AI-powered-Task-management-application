import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

function TaskPaginationControls({
  navigatePrevious,
  navigateNext,
  navigateToToday,
  previousDisabled,
}: {
  navigatePrevious: () => void;
  navigateNext: () => void;
  navigateToToday: () => void;
  previousDisabled: boolean;
}) {
  return (
    <div className="flex rounded-lg border border-neutral-200 text-sm items-center shadow-xs bg-background text-secondary-foreground overflow-hidden">
      <button
        className={cn(
          "border-r  flex items-center justify-center px-2 py-1.5 hover:bg-accent duration-300 transition-all",
          previousDisabled && "cursor-not-allowed opacity-50"
        )}
        onClick={navigatePrevious}
        disabled={previousDisabled}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={navigateToToday}
        className="hover:bg-accent px-3 py-1.5 duration-300 transition-all"
      >
        Today
      </button>
      <button
        className="border-l flex items-center justify-center px-2 py-1.5 hover:bg-accent duration-300 transition-all "
        onClick={navigateNext}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export default TaskPaginationControls;
