import EmptyWorkspace from "@/features/workspace/components/EmptyWorkspace";
import { useAddWorkspaceModal } from "@/components/modals/AddWorkspaceModal";
import WorkspaceCard from "@/features/workspace/components/WorkspaceCard";
import WorkspaceCardPlaceholder from "@/features/workspace/components/WorkspaceCardPlaceholder";
import ProjectListWrapper from "@/features/projects/components/ProjectListWrapper";
import { useWorkspaces } from "@/hooks/use-workspaces";
import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { Users } from "lucide-react";

function Workspaces() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const { CreateWorkspaceButton, AddWorkspaceModal } = useAddWorkspaceModal();

  return (
    <div className="h-full">
      <PageContentHeader
        title={
          <div className="flex gap-2 items-center">
            <Users className="size-5" />
            <span>Workspaces</span>
          </div>
        }
        controls={<CreateWorkspaceButton />}
      />
      <PageWidthWrapper className="pt-10 max-w-3xl">
        <div className="pt-6">
          {isLoading ? (
            <>
              {Array.from({ length: 3 }, (_, index) => (
                <ProjectListWrapper key={index} id={index}>
                  <WorkspaceCardPlaceholder />
                </ProjectListWrapper>
              ))}
            </>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <ProjectListWrapper key={workspace.id} id={workspace.id}>
                <WorkspaceCard workspace={workspace} />
              </ProjectListWrapper>
            ))
          ) : (
            <EmptyWorkspace addButton={<CreateWorkspaceButton />} />
          )}
        </div>
      </PageWidthWrapper>
      <AddWorkspaceModal />
    </div>
  );
}

export default Workspaces;
