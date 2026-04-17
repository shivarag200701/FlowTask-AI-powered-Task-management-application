import { AppSidebar } from "@/components/app-sidebar";
import { ModalProvider } from "@/components/modals/ModalProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskDisplayProvider } from "@/context/TaskDisplayContext";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <TaskDisplayProvider>
      <ModalProvider>
        <SidebarProvider>
          <AppSidebar />
          <Outlet />
        </SidebarProvider>
      </ModalProvider>
    </TaskDisplayProvider>
  );
}

export default AppLayout;
