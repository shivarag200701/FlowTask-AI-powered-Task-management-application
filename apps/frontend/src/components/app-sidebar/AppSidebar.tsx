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
import { NavAssistantQuickLinks } from "./NavAssistantQuickLinks";
import ConversationList from "@/features/assistant/components/ConversationList";
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

  const location = useLocation();
  const workspaceSlug = useWorkspaceSlug();
  const isAssistantPage = location.pathname.startsWith("/app/assistant");

  if (isAssistantPage) {
    return (
      <Sidebar
        collapsible="offcanvas"
        {...props}
        className="p-2 bg-neutral-200"
      >
        <div className="flex h-full rounded-xl overflow-hidden">
          {/* Icon rail */}
          <div className="w-12 shrink-0 bg-neutral-100 border-r border-neutral-200">
            <NavAssistantQuickLinks />
          </div>

          {/* Conversation list */}
          <div className="flex-1 min-w-0 bg-neutral-100 flex flex-col">
            <ConversationList />
          </div>
        </div>
      </Sidebar>
    );
  }

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
