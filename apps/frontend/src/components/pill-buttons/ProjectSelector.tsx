import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import ComboBox from "../ComboBox";
import { useProjects } from "@/hooks/use-projects";
import type { Project, SectionWithoutTodos } from "@/types";
import { Hash, Inbox, PanelTop } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { useUpdateTodo } from "@/hooks/use-todos";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/query-keys";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function ProjectSelector({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [searchValue, setSearchValue] = useState("");

  const { setValue } = useFormContext();

  const [projectId, sectionId, todoId] = useWatch({
    name: ["projectId", "projectSectionId", "id"],
  });

  const { data: projects, isLoading } = useProjects();

  const project = projects?.find((p) => p.id === projectId);
  const section = project?.sections.find((s) => s.id === sectionId);

  function getSectionOption(section: SectionWithoutTodos) {
    return {
      value: section.id,
      label: section.name,
      optionId: section.projectId,
      icon: <PanelTop className="size-3.5 text-neutral-500" />,
    };
  }

  function getProjectOption(project: Project) {
    return {
      value: project.id,
      label: project.name,
      optionSelected: true,
      icon:
        project.name === "Inbox" ? (
          <Inbox className="size-3.5 text-neutral-500" />
        ) : (
          <Hash className="size-3.5 text-neutral-500" />
        ),
      subOptions: project.sections.map((section) => getSectionOption(section)),
    };
  }

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate } = useUpdateTodo(projectId);

  const options = useMemo(
    () => projects?.map((project) => getProjectOption(project)),
    [projects, getProjectOption, getSectionOption]
  );
  return (
    <ComboBox
      open={open}
      onOpenChange={setOpen}
      shouldFilter
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      trigger
      triggerClassName="py-2 px-4 text-xs"
      inputBoxText="Type a project name"
      contentClassName="w-[250px]"
      options={isLoading ? undefined : options}
      icon={<Hash className="size-3.5" />}
      onSelect={(option) => {
        const newProjectId = option.optionSelected
          ? option.value
          : option.optionId;
        const newSectionId = option.optionSelected ? null : option.value;

        setValue("projectId", newProjectId);
        setValue("projectSectionId", newSectionId);
        const targetProject = projects?.find((p) => p.id === newProjectId);

        mutate(
          {
            id: todoId,
            data: {
              projectId: newProjectId,
              projectSectionId: newSectionId,
            },
          },
          {
            onSuccess: () => {
              if (projectId) {
                queryClient.invalidateQueries({
                  queryKey: projectKeys.sections(projectId),
                });
              }
              if (newProjectId && newProjectId !== projectId) {
                queryClient.invalidateQueries({
                  queryKey: projectKeys.project(newProjectId),
                });
                queryClient.invalidateQueries({
                  queryKey: projectKeys.sections(newProjectId),
                });
              }

              toast.success(
                <span>
                  Task moved to{" "}
                  {targetProject?.slug ? (
                    <button
                      className="underline cursor-pointer"
                      onClick={() =>
                        navigate(`/app/projects/${targetProject.slug}`)
                      }
                    >
                      {targetProject.name}
                    </button>
                  ) : targetProject?.name === "Inbox" ? (
                    <button
                      className="underline cursor-pointer"
                      onClick={() => navigate(`/app/projects/inbox`)}
                    >
                      {targetProject.name}
                    </button>
                  ) : (
                    <span>{targetProject?.name}</span>
                  )}
                </span>
              );
            },
          }
        );
      }}
    >
      <div className="flex items-center gap-1 max-w-[100px]">
        <span className="truncate">{project?.name}</span>
        {section && (
          <>
            <span>/</span>
            <span className="truncate">{section.name}</span>
          </>
        )}
      </div>
    </ComboBox>
  );
}

export default ProjectSelector;
