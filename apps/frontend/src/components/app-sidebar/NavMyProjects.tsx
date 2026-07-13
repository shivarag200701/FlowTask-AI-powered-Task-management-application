import { ChevronDown } from "lucide-react";
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
} from "../ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePersonalProject } from "@/hooks/use-projects";
import { useUserProfile } from "@/hooks/use-users";
import type { Project } from "@/types";

export function NavMyProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: projects, isLoading } = usePersonalProject("");
  const { data: userProfile } = useUserProfile();
  const isMyProjectsActive = location.pathname === "/app/projects";
  const projectCount = projects?.length ?? 0;

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="group/myprojects">
        <div
          onClick={() => navigate("/app/projects")}
          className={`flex items-center gap-3 w-full rounded-lg px-2 py-2.5 transition-all hover:bg-neutral-200 cursor-pointer ${
            isMyProjectsActive ? "bg-primary/10 text-primary" : ""
          }`}
        >
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
          <span className="text-sm font-medium truncate">My Projects</span>
          {projectCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {projectCount}
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
              ) : projects && projects?.length > 0 ? (
                projects?.map((project: Project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      className="hover:bg-neutral-200 cursor-pointer"
                      isActive={
                        location.pathname === `/app/projects/${project.slug}`
                      }
                      onClick={() => navigate(`/app/projects/${project.slug}`)}
                    >
                      <span># {project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No projects yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
