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
          <div className="bg-neutral-200 w-full  lg:py-2 lg:pr-2">
            <div className="bg-white min-h-0 lg:rounded-xl overflow-y-auto [--page-bottom-margin:0px] [--page-top-margin:0px] md:[--page-bottom-margin:0.5rem] md:[--page-top-margin:0.5rem] [--page-height:calc(100vh-var(--page-top-margin)-var(--page-bottom-margin)-1px)] h-(--page-height)">
              <Outlet />
            </div>
          </div>
        </SidebarProvider>
      </ModalProvider>
    </TaskDisplayProvider>
  );
}

export default AppLayout;
