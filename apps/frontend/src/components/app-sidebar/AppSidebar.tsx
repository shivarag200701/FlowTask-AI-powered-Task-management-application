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
import { NavWorkspaceContext } from "./NavWorkspaceContext";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

function useWorkspaceSlug(): string | null {
  const location = useLocation();
  const match = location.pathname.match(/^\/app\/workspaces\/([^/]+)/);
  if (!match) return null;
  const slug = match[1];
  // Don't treat list-level paths as workspace context
  if (!slug || slug === "invite") return null;
  return slug;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setShowSearchModal } = React.useContext(ModalContext);
  useHotkeys("mod+k", () => {
    setShowSearchModal(true);
  });

  const workspaceSlug = useWorkspaceSlug();

  return (
    <Sidebar collapsible="offcanvas" {...props} className="p-2 bg-neutral-200">
      <SidebarContent className="overflow-hidden">
        <AnimatePresence mode="wait">
          {workspaceSlug ? (
            <motion.div
              key="workspace"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{
                duration: 0.1,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <NavWorkspaceContext slug={workspaceSlug} />
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{
                duration: 0.1,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <NavQuickLinks />
              <NavMyProjects />
              <NavWorkspaces />
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
