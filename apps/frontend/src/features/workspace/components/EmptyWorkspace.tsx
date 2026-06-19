import { AnimatedEmptyState } from "@/components/ui/animated-empty-state";
import { Users } from "lucide-react";
import type { ReactNode } from "react";

function EmptyWorkspace({ addButton }: { addButton: ReactNode }) {
  return (
    <AnimatedEmptyState
      title="Collaborate with your team"
      description="Create a workspace to invite team members and work on projects together"
      className="border-none"
      cardContent={(index) => {
        const workspaces = [
          { name: "Engineering", members: 5 },
          { name: "Design", members: 3 },
          { name: "Product", members: 4 },
        ];
        const ws = workspaces[index % workspaces.length];
        return (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100">
              <Users className="size-3.5 text-neutral-500" />
            </div>
            <div className="h-2.5 w-24 min-w-0 rounded-sm bg-neutral-200" />
            <div className="flex grow items-center justify-end gap-1 text-xs text-neutral-400">
              <Users className="size-3" />
              <span>{ws.members}</span>
            </div>
          </>
        );
      }}
      cardCount={3}
      addButton={addButton}
    />
  );
}

export default EmptyWorkspace;
