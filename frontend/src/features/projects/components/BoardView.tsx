import { AnimatedEmptyState } from "@/components/ui/animated-empty-state";
import { Columns3 } from "lucide-react";

function BoardView({ id }: { id: string }) {
  return (
    <div className="h-full">
      <AnimatedEmptyState
        title="Board view is coming soon"
        description="Organize your tasks in a kanban-style board with drag-and-drop columns"
        className="border-none"
        cardContent={(index) => {
          const columns = [
            { name: "To Do", count: 4 },
            { name: "In Progress", count: 2 },
            { name: "Done", count: 6 },
          ];
          const col = columns[index % columns.length];
          return (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100">
                <Columns3 className="size-3.5 text-neutral-500" />
              </div>
              <div className="h-2.5 w-24 min-w-0 rounded-sm bg-neutral-200" />
              <div className="flex grow items-center justify-end gap-1 text-xs text-neutral-400">
                <span>{col.count} tasks</span>
              </div>
            </>
          );
        }}
        cardCount={3}
        pillContent="Coming soon"
      />
    </div>
  );
}

export default BoardView;
