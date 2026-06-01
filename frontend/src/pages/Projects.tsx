import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectProvider } from "@/context/ProjectContext";
import BoardView from "@/features/projects/components/BoardView";
import ListView from "@/features/projects/components/ListView";
import TaskDisplaySelector from "@/features/projects/components/TaskDisplaySelector";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProject } from "@/hooks/use-projects";
import PageContentHeader from "@/layouts/PageContentHeader";
import type { ViewMode } from "@/types";
import { extractIdFromSlug } from "@shiva200701/todotypes";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Projects() {
  const location = useLocation();

  const id = useMemo(() => {
    return extractIdFromSlug(location.pathname.split("/").at(-1) ?? "");
  }, [location.pathname.split("/").at(-1)]);

  return <ProjectDetail key={id} id={id} />;
}

function ProjectDetail({ id }: { id: string }) {
  const { data: project } = useProject(id);

  const persisted = project?.taskDisplayPreferences?.viewMode ?? "list";

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (project?.taskDisplayPreferences?.viewMode) {
      setViewMode(project.taskDisplayPreferences.viewMode);
    }
  }, [project?.taskDisplayPreferences?.viewMode]);

  const isDirty = viewMode !== persisted;

  const { isMobile } = useMediaQuery();

  return (
    <div>
      <ProjectProvider id={id}>
        {/*Need to implement a bread crumb like structure for this titlte of the PageContentHeader */}
        <PageContentHeader
          title={!isMobile && <BreadCrumb projectName={project?.name} />}
          controls={
            <TaskDisplaySelector
              isDirty={isDirty}
              viewMode={viewMode}
              persisted={persisted}
              setViewMode={setViewMode}
              id={id}
            />
          }
        />
        {viewMode === "list" && <ListView id={id} />}
        {viewMode === "board" && <BoardView />}
      </ProjectProvider>
    </div>
  );
}

function BreadCrumb({ projectName }: { projectName?: string }) {
  const navigate = useNavigate();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => {
              navigate("/app/projects");
            }}
          >
            My Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{projectName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
