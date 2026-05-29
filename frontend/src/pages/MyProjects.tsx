import { AnimatedEmptyState } from "@/components/ui/animated-empty-state";
import PageContentHeader from "@/layouts/PageContentHeader";
import { FolderOpen } from "lucide-react";

function MyProjects() {
  return (
    <div className="h-full">
      <PageContentHeader title="My Projects" />
      <AnimatedEmptyState
        title="Organize your work"
        description="Create projects to group related tasks together and stay on top of what matters"
        className="border-none"
        cardContent={(index) => {
          const projects = [
            { name: "Website Redesign", color: "bg-blue-400" },
            { name: "Mobile App", color: "bg-emerald-400" },
            { name: "Marketing Campaign", color: "bg-violet-400" },
          ];
          const project = projects[index % projects.length];
          return (
            <>
              <div className={`h-3 w-3 rounded-full ${project.color}`} />
              <div className="h-2.5 w-28 min-w-0 rounded-sm bg-neutral-200" />
              <div className="flex grow items-center justify-end gap-1.5 text-neutral-400">
                <FolderOpen className="size-3.5" />
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

export default MyProjects;
