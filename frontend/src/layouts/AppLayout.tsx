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
          <div className="bg-neutral-200 w-full lg:py-2 lg:pr-2 hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="bg-white h-full lg:rounded-xl">
              <Outlet />
            </div>
          </div>
        </SidebarProvider>
      </ModalProvider>
    </TaskDisplayProvider>
  );
}

export default AppLayout;
