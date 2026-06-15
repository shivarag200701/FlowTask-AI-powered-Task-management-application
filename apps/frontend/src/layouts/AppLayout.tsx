import { AppSidebar } from "@/components/app-sidebar";
import AiTaskFab from "@/components/AiTaskFab";
import { ModalProvider } from "@/components/modals/ModalProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskDisplayProvider } from "@/context/TaskDisplayContext";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <TaskDisplayProvider>
      <ModalProvider>
        <SidebarProvider className="md:h-dvh md:overflow-hidden">
          <AppSidebar />
          <div className="min-h-0 w-full min-w-0 flex-1 bg-neutral-200 lg:py-2 lg:pr-2">
            <div
              className={cn(
                "w-full bg-white lg:rounded-xl",
                "min-h-dvh md:min-h-0",
                "md:overflow-y-auto",
                "[--page-bottom-margin:0px] [--page-top-margin:0px] md:[--page-bottom-margin:0.5rem] md:[--page-top-margin:0.5rem]",
                "[--page-height:calc(100dvh-var(--page-top-margin)-var(--page-bottom-margin)-1px)] md:h-(--page-height)"
              )}
            >
              <Outlet />
            </div>
          </div>
          <AiTaskFab />
        </SidebarProvider>
      </ModalProvider>
    </TaskDisplayProvider>
  );
}

export default AppLayout;
