import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EmptyState from "@/components/EmptyState";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { ProjectProvider } from "@/context/ProjectContext";
import BoardView from "@/features/projects/components/board-view/BoardView";
import ListView from "@/features/projects/components/list-view/ListView";
import TaskDisplaySelector from "@/features/projects/components/TaskDisplaySelector";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProject } from "@/hooks/use-projects";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types";
import { extractIdFromSlug } from "@shiva200701/todotypes";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const location = useLocation();

  const id = useMemo(() => {
    return extractIdFromSlug(location.pathname.split("/").at(-1) ?? "");
  }, [location.pathname.split("/").at(-1)]);

  return <ProjectDetail key={id} id={id} />;
}

function ProjectDetail({ id }: { id: string }) {
  const { data: project, isLoading } = useProject(id);

  const persisted = project?.taskDisplayPreferences?.viewMode ?? "list";

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (project?.taskDisplayPreferences?.viewMode) {
      setViewMode(project.taskDisplayPreferences.viewMode);
    }
  }, [project?.taskDisplayPreferences?.viewMode]);

  const isDirty = viewMode !== persisted;

  const { isMobile } = useMediaQuery();

  const navigate = useNavigate();

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (!project) {
    return (
      <PageWidthWrapper className="py-10">
        <EmptyState
          title="Project not found"
          description="This project doesn't exist or may have been deleted."
          addButton={
            <Button
              variant="default"
              onClick={() => navigate("/app/projects")}
              Initial="Go to Projects"
            />
          }
        />
      </PageWidthWrapper>
    );
  }

  return (
    <div
      className={cn("h-full ", {
        "overflow-hidden": viewMode === "board",
      })}
    >
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

function TaskRowSkeleton({ width = "w-40" }: { width?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-border px-4 py-2.5 min-h-15">
      <div className="flex gap-4 items-start">
        <Skeleton className="size-5 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className={`h-4 ${width}`} />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="gap-2 items-center hidden sm:flex">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="mt-4">
      <div className="flex gap-2 items-center border-b border-border py-3">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-4" />
      </div>
      {Array.from({ length: 1 }, (_, i) => (
        <TaskRowSkeleton key={i} width={i % 2 === 0 ? "w-36" : "w-48"} />
      ))}
    </div>
  );
}

function ProjectSkeleton() {
  const widths = ["w-44", "w-36"];
  return (
    <div>
      <div className="border-b border-border h-12 sm:h-16" />
      <PageWidthWrapper className="max-w-5xl p-10">
        <Skeleton className="h-8 w-52" />
        <div className="mt-5 flex flex-col">
          {widths.map((w, i) => (
            <TaskRowSkeleton key={i} width={w} />
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <SectionSkeleton />
        <SectionSkeleton />
      </PageWidthWrapper>
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
