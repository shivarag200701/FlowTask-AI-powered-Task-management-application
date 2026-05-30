import * as React from "react";
import { NavUser } from "@/components/app-sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ModalContext } from "../modals/ModalProvider";
import { useHotkeys } from "react-hotkeys-hook";
import { NavQuickLinks } from "./NavQuickLinks";
import { NavMyProjects } from "./NavMyProjects";
import { NavWorkspaces } from "./NavWorkspaces";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setShowSearchModal } = React.useContext(ModalContext);
  useHotkeys("mod+k", () => {
    setShowSearchModal(true);
  });

  return (
    <Sidebar collapsible="offcanvas" {...props} className="p-2 bg-neutral-200">
      <SidebarContent>
        <NavQuickLinks />
        <NavMyProjects />
        <NavWorkspaces />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
