import { AppSidebar } from "@/components/app-sidebar";
import { ModalProvider } from "@/components/modals/ModalProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskDisplayProvider } from "@/context/TaskDisplayContext";
import { AssistantNavProvider } from "@/features/assistant/context/AssistantNavContext";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/query-keys";
import { getCurrentUser } from "@/api";
import api from "@/utils/functions/api";
import { ConfettiSideCannons } from "@/components/ui/confetti-side-cannons";

function AppLayout() {
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: user } = useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (user && !user.firstDashboardVisited) {
      setShowConfetti(true);

      api.post("/api/v1/user/first-dashboard-visited").then(() => {
        queryClient.setQueryData(authQueryKeys.users, {
          ...user,
          firstDashboardVisited: true,
        });
      });
    }
  }, [user]);

  return (
    <TaskDisplayProvider>
      <AssistantNavProvider>
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
            {showConfetti && <ConfettiSideCannons />}
          </SidebarProvider>
        </ModalProvider>
      </AssistantNavProvider>
    </TaskDisplayProvider>
  );
}

export default AppLayout;
