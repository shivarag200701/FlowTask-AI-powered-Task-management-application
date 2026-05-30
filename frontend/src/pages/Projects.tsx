import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BoardView from "@/features/projects/components/BoardView";
import ListView from "@/features/projects/components/ListView";
import TaskDisplaySelector from "@/features/projects/components/TaskDisplaySelector";
import { useProject } from "@/hooks/use-projects";
import PageContentHeader from "@/layouts/PageContentHeader";
import type { ViewMode } from "@/types";
import { extractIdFromSlug } from "@shiva200701/todotypes";
import { useMemo, useState } from "react";
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

  const [viewMode, setViewMode] = useState<ViewMode>(
    () => project?.taskDisplayPreferences?.viewMode ?? "list"
  );

  const isDirty = viewMode !== persisted;

  return (
    <div>
      {/*Need to implement a bread crumb like structure for this titlte of the PageContentHeader */}
      <PageContentHeader
        title={<BreadCrumb projectName={project?.name} />}
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
      {viewMode === "board" && <BoardView id={id} />}
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
