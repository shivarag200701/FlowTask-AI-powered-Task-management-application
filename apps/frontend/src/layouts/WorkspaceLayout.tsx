import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { useWorkspace } from "@/hooks/use-workspaces";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useInviteMemberModal } from "@/components/modals/InviteMemberModal";
import { useCopyInviteLinkModal } from "@/components/modals/CopyInviteLinkModal";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function WorkspaceLayoutPage() {
  const { slug } = useParams<{ slug: string }>();

  return <WorkspaceLayout key={slug} id={slug!} />;
}

export function WorkspaceLayout({ id }: { id: string }) {
  const { data: workspace, isLoading } = useWorkspace(id);
  const navigate = useNavigate();
  const { InviteMemberButton, InviteMemberModal } = useInviteMemberModal({
    workspace,
  });
  const { CopyInviteLinkButton, CopyInviteLinkModal } = useCopyInviteLinkModal({
    workspace,
  });

  const { isMobile } = useMediaQuery();

  if (true) {
    return <WorkspaceDetailSkeleton />;
  }

  if (!workspace) {
    return (
      <PageWidthWrapper className="py-10">
        <EmptyState
          title="Workspace not found"
          description="This workspace doesn't exist or you don't have access to it."
          addButton={
            <Button
              variant="default"
              onClick={() => navigate("/app/workspaces")}
            >
              Go to Workspaces
            </Button>
          }
        />
      </PageWidthWrapper>
    );
  }

  return (
    <div className="h-full">
      <PageContentHeader
        title={!isMobile && <BreadCrumb workspaceName={workspace.name} />}
        controls={
          <div className="flex items-center gap-2">
            <InviteMemberButton />
            <CopyInviteLinkButton />
          </div>
        }
      />
      <PageWidthWrapper className="max-w-7xl py-8 space-y-8">
        <Outlet context={{ workspace }} />
        <InviteMemberModal />
        <CopyInviteLinkModal />
      </PageWidthWrapper>
    </div>
  );
}

function WorkspaceDetailSkeleton() {
  return (
    <div>
      <div className="border-b border-border h-12 sm:h-16" />
      <PageWidthWrapper className="max-w-4xl py-8 space-y-8">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div>
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="rounded-lg border border-border divide-y divide-border">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </PageWidthWrapper>
    </div>
  );
}

function BreadCrumb({ workspaceName }: { workspaceName: string }) {
  const navigate = useNavigate();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/app/workspaces")}>
            Workspaces
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{workspaceName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
