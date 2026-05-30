import { useAddProjectModal } from "@/components/modals/AddProjectModal";
import EmptyState from "@/components/EmptyState";
import { SearchBoxPersisted } from "@/components/SearchBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProjectCard from "@/features/projects/components/ProjectCard";
import ProjectCardPlaceholder from "@/features/projects/components/ProjectCardPlaceholder";
import ProjectListWrapper from "@/features/projects/components/ProjectListWrapper";
import { usePersonalProject } from "@/hooks/use-projects";
import { useUserProfile } from "@/hooks/use-users";
import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { Project } from "@/types";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function MyProjects() {
  const { data: userProfile } = useUserProfile();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);

  const { CreateProjectButton, AddProjectModal } = useAddProjectModal({
    personal: true,
  });

  const search = searchParams.get("search");

  const { data: filteredProjects, isLoading } = usePersonalProject(
    search ?? ""
  );

  useEffect(() => {
    setProjects(filteredProjects);
  }, [filteredProjects]);

  return (
    <div className="h-full">
      <PageContentHeader
        title={
          <div className="flex gap-2">
            <Avatar className="h-6 w-6 rounded-full ring-2 ring-neutral-300">
              {userProfile?.image && (
                <AvatarImage
                  src={userProfile.image}
                  alt={userProfile?.name ?? "User"}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="rounded-full text-xs">
                {userProfile?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span>My Projects</span>
          </div>
        }
        controls={<CreateProjectButton />}
      />
      <PageWidthWrapper className="pt-10 max-w-3xl">
        <SearchBoxPersisted className="w-full" />
        <div className="pt-6">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }, (_, index) => (
                <ProjectListWrapper key={index} id={index}>
                  <ProjectCardPlaceholder />
                </ProjectListWrapper>
              ))}
            </>
          ) : projects?.length > 0 ? (
            projects.map((project) => (
              <ProjectListWrapper key={project.id} id={project.id}>
                <ProjectCard project={project} />
              </ProjectListWrapper>
            ))
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create a project to organize your tasks"
              addButton={<CreateProjectButton />}
            />
          )}
        </div>
      </PageWidthWrapper>
      <AddProjectModal />
    </div>
  );
}

export default MyProjects;
