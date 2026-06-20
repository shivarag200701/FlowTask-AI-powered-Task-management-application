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
import { useUserProfile } from "@/hooks/use-users";
import { extractIdFromSlug } from "@shiva200701/todotypes";
import { Crown } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useInviteMemberModal } from "@/components/modals/InviteMemberModal";
import { useCopyInviteLinkModal } from "@/components/modals/CopyInviteLinkModal";

export default function WorkspaceDetailPage() {
  const location = useLocation();

  const id = useMemo(() => {
    return extractIdFromSlug(location.pathname.split("/").at(-1) ?? "");
  }, [location.pathname.split("/").at(-1)]);

  return <WorkspaceDetailView key={id} id={id} />;
}

function WorkspaceDetailView({ id }: { id: string }) {
  const { data: workspace, isLoading } = useWorkspace(id);
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const { InviteMemberButton, InviteMemberModal } = useInviteMemberModal();
  const { CopyInviteLinkButton, CopyInviteLinkModal } = useCopyInviteLinkModal({
    workspace,
  });

  if (isLoading) {
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
        title={<BreadCrumb workspaceName={workspace.name} />}
        controls={
          <div className="flex items-center gap-2">
            <InviteMemberButton />
            <CopyInviteLinkButton />
          </div>
        }
      />
      <PageWidthWrapper className="max-w-4xl py-8 space-y-8">
        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Members
            </h3>
          </div>
          <div className="rounded-lg border border-border divide-y divide-border">
            {workspace.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium">
                    {member.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name}
                      {member.user.id === userProfile?.id && (
                        <span className="text-muted-foreground ml-1">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    member.role === "owner"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {member.role === "owner" && <Crown className="size-3" />}
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
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
