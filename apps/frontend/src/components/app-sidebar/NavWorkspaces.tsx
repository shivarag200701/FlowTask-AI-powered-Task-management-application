import { ChevronDown, Crown, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUserProfile } from "@/hooks/use-users";
import { Avatar, AvatarImage } from "../ui/avatar";

export function NavWorkspaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { data: userProfile } = useUserProfile();
  const isWorkspacesActive = location.pathname === "/app/workspace";
  const workspacesCount = workspaces?.length ?? 0;

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <div
          onClick={() => navigate("/app/workspaces")}
          className={`flex items-center gap-3 w-full rounded-lg px-2 py-2.5 transition-all hover:bg-neutral-200 cursor-pointer ${
            isWorkspacesActive ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-300">
            <Users className="size-3.5 text-neutral-500" />
          </div>
          <span className="text-sm font-medium truncate">Workspaces</span>
          {workspacesCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {workspacesCount}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <CollapsibleTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-neutral-300 transition-all duration-200 cursor-pointer"
              >
                <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                Array.from({ length: 3 }, (_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))
              ) : workspaces && workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <SidebarMenuItem key={workspace.id}>
                    <SidebarMenuButton
                      className="hover:bg-neutral-200 cursor-pointer"
                      isActive={location.pathname.includes(workspace.slug)}
                      onClick={() =>
                        navigate(`/app/workspaces/${workspace.slug}`)
                      }
                    >
                      <div className="flex gap-2">
                        <Avatar className="h-6 w-6 rounded-full ring-2 ring-neutral-300">
                          {
                            <AvatarImage
                              src={
                                workspace.icon ||
                                `https://avatar.vercel.sh/${workspace.id}`
                              }
                              alt={workspace?.name ?? "Workspace"}
                              referrerPolicy="no-referrer"
                            />
                          }
                        </Avatar>
                        <span className="flex items-center gap-1.5">
                          {workspace.name}
                          {workspace.createdBy === userProfile?.id && (
                            <Crown className="size-3 text-amber-500" />
                          )}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No workspaces yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
