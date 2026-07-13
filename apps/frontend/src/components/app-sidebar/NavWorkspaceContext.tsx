import { ArrowLeft, LayoutDashboard, Settings, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useWorkspace } from "@/hooks/use-workspaces";
import { Avatar, AvatarImage } from "../ui/avatar";

const workspaceLinks = [
  { label: "Overview", icon: LayoutDashboard, path: "/" },
  { label: "Members", icon: Users, path: "members" },
  { label: "Settings", icon: Settings, path: "settings" },
] as const;

export function NavWorkspaceContext({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspace, isLoading } = useWorkspace(slug);

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-neutral-200"
              onClick={() => navigate("/app/workspaces")}
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <div className="flex items-center gap-3 px-2 py-2">
          {isLoading ? (
            <SidebarMenuSkeleton />
          ) : workspace ? (
            <>
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-neutral-300">
                <AvatarImage
                  src={
                    workspace.icon || `https://avatar.vercel.sh/${workspace.id}`
                  }
                  alt={workspace.name}
                  referrerPolicy="no-referrer"
                />
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {workspace.name}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu>
          {workspaceLinks.map((link) => {
            const fullPath = `/app/workspaces/${slug}/${link.path}`;
            const isActive =
              location.pathname === fullPath ||
              (link.path === "/" &&
                location.pathname === `/app/workspaces/${slug}`);

            return (
              <SidebarMenuItem key={link.label}>
                <SidebarMenuButton
                  className="hover:bg-neutral-200 cursor-pointer"
                  isActive={isActive}
                  onClick={() => navigate(fullPath)}
                >
                  <link.icon strokeWidth={1.5} size={16} />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
