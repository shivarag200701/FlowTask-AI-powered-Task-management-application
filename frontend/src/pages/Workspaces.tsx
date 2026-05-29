import { AnimatedEmptyState } from "@/components/ui/animated-empty-state";
import PageContentHeader from "@/layouts/PageContentHeader";
import { Users } from "lucide-react";

function Workspaces() {
  return (
    <div className="h-full">
      <PageContentHeader title="Workspaces" />
      <AnimatedEmptyState
        title="Collaborate with your team"
        description="Create workspaces to invite team members and work on projects together"
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
        pillContent="Coming soon"
      />
    </div>
  );
}

export default Workspaces;
