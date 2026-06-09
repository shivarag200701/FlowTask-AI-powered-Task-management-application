import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { useDeleteProject, useUpdateProject } from "@/hooks/use-projects";
import type { Project } from "@/types";
import pluralize from "@/utils/functions/pluralize";
import { Hash, ListTodo, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectCard({ project }: { project: Project }) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const { mutate: updateProject } = useUpdateProject(project.id);

  const todoCount = project?.todos?.length;

  const { mutate: deleteTodo } = useDeleteProject(project.id);

  return (
    <div
      className="flex justify-between items-center py-3 px-4 select-none cursor-pointer"
      onClick={() => {
        if (project.slug) {
          navigate(`/app/projects/${project.slug}`);
        }
      }}
    >
      <div className="flex gap-3 items-center min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Hash className="size-4" />
        </div>
        <div className="min-w-0">
          {isEditMode ? (
            <Input
              autoFocus
              defaultValue={project.name}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  updateProject({
                    id: project.id,
                    data: { name: e.currentTarget.value },
                  });
                  setIsEditMode(false);
                }
                if (e.key === "Escape") {
                  setIsEditMode(false);
                }
              }}
              onBlur={(e) => {
                if (e.target.value !== project.name) {
                  updateProject({
                    id: project.id,
                    data: { name: e.target.value },
                  });
                }
                setIsEditMode(false);
              }}
              className="h-7 text-sm font-medium px-1"
            />
          ) : (
            <p className="text-sm font-medium truncate">{project.name}</p>
          )}
        </div>
      </div>
      <div className="flex gap-4 items-center shrink-0">
        <Button
          variant="outline"
          Initial={`${todoCount} ${pluralize("task", todoCount)}`}
          size="sm"
          className="w-[80px] bg-accent/50"
          icon={<ListTodo />}
        />
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={
            <div className="py-1 text-sm">
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-accent rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoreOptionsOpen(false);
                  setIsEditMode(true);
                }}
              >
                Rename
              </button>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-accent rounded-md text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoreOptionsOpen(false);
                  deleteTodo();
                }}
              >
                Delete
              </button>
            </div>
          }
          sideOffset={5}
          side="bottom"
          align="end"
        >
          <Button
            variant="custom"
            className="w-fit"
            icon={<MoreVertical color="#808080" strokeWidth={2.5} />}
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Popover>
      </div>
    </div>
  );
}

export default ProjectCard;
