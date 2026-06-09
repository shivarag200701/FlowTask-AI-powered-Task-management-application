import { ChevronRight, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function NavWorkspaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.includes("/app/workspace");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <button
          onClick={() => navigate("/app/workspace")}
          className={`flex items-center gap-3 w-full rounded-lg px-2 py-2.5 transition-all hover:bg-neutral-200 cursor-pointer ${
            isActive ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-300">
            <Users className="size-3.5 text-neutral-500" />
          </div>
          <span className="text-sm font-medium truncate">Workspaces</span>
          <ChevronRight className="ml-auto h-4 w-4 text-neutral-400" />
        </button>
        <p className="px-2 pt-1 text-xs text-muted-foreground">Coming soon</p>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
