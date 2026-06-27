import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "@/App.css";
import SignIn from "@/pages/SignIn";
import Signup from "@/pages/Signup";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { SignupProvider } from "@/context/SingupContext";
import Landing from "@/pages/Landing";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Welcome from "@/pages/onboarding/pages/Welcome";
import UserProfile from "@/pages/onboarding/pages/UserProfile";
import { Completed as OnboardingCompleted } from "@/pages/onboarding/pages/Completed";
import CompletedTasks from "@/pages/CompletedTasks";
import PublicRoute from "@/routes/PublicRoute";
import AppLayout from "./layouts/AppLayout";
import Today from "./pages/Today";
import Upcoming from "./pages/Upcoming";
import { TooltipProvider } from "@/components/ui/tooltip";
import Tags from "./pages/Tags";
import SuccessIcon from "./components/icons/success-icon";
import Todos from "./pages/todos";
import { TaskSelectionProvider } from "./context/TaskSelectionContext";
import Search from "./pages/Search";
import TaskDetail from "./pages/TaskDetail";
import MyProjects from "./pages/MyProjects";
import Workspaces from "./pages/Workspaces";
import Projects from "./pages/Projects";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import Inbox from "./pages/Inbox";
import Invite from "./pages/Invite";
import WorkspaceInviteAccept from "./pages/WorkspaceInviteAccept";
import { WorkspaceMembers } from "./features/workspace/components/WorkspaceMembers";
import WorkspaceSettings from "./features/workspace/components/WorkspaceSettings";
import WorkspaceOverview from "./features/workspace/components/WorkspaceOverview";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = (
    location.state as { backgroundLocation?: Location }
  )?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding/welcome" element={<Welcome />} />
          <Route path="/onboarding/user-profile" element={<UserProfile />} />
          <Route
            path="/onboarding/completed"
            element={<OnboardingCompleted />}
          />
          <Route path="app/invites/:inviteCode" element={<Invite />} />
          <Route
            path="/app/workspaces/:slug/invite"
            element={<WorkspaceInviteAccept />}
          />
          <Route element={<AppLayout />}>
            <Route
              path="/app/today"
              element={
                <TaskSelectionProvider>
                  <Today />
                </TaskSelectionProvider>
              }
            />
            <Route
              path="/app/upcoming"
              element={
                <TaskSelectionProvider>
                  <Upcoming />
                </TaskSelectionProvider>
              }
            />
            <Route
              path="/app/inbox"
              element={
                <TaskSelectionProvider>
                  <Inbox />
                </TaskSelectionProvider>
              }
            />
            <Route path="/app/tags" element={<Tags />} />
            <Route path="/app/todos" element={<Todos />} />
            <Route
              path="/app/completed"
              element={
                <TaskSelectionProvider>
                  <CompletedTasks />
                </TaskSelectionProvider>
              }
            />
            <Route path="/app/projects" element={<MyProjects />} />
            <Route path="/app/workspaces" element={<Workspaces />} />
            <Route path="/app/workspaces/:slug" element={<WorkspaceLayout />}>
              <Route index element={<WorkspaceOverview />} />
              <Route path="members" element={<WorkspaceMembers />} />
              <Route path="settings" element={<WorkspaceSettings />} />
            </Route>
            <Route path="/app/search/*" element={<Search />} />
            <Route path="/app/task/:slug" element={<TaskDetail />} />
            <Route path="/app/projects/*" element={<Projects />} />
          </Route>
        </Route>
      </Routes>

      {/* Modal overlay on top of the background page when navigated from within the app */}
      {backgroundLocation && (
        <Routes>
          <Route path="/app/task/:slug" element={<TaskDetail />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  // Add scroll detection for custom scrollbars
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = (event: Event) => {
      const element = event.currentTarget as Element;

      // Add is-scrolling class immediately
      element.classList.add("is-scrolling");

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Remove class after scrolling stops
      scrollTimeout = window.setTimeout(() => {
        element.classList.remove("is-scrolling");
      }, 500);
    };

    // Add listener to all custom-scrollbar elements
    const scrollElements = document.querySelectorAll(".custom-scrollbar");
    scrollElements.forEach((el) => {
      el.addEventListener("scroll", handleScroll, { passive: true });
    });

    // Cleanup
    return () => {
      scrollElements.forEach((el) => {
        el.removeEventListener("scroll", handleScroll);
      });
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          themes={["dark", "light"]}
        >
          <TooltipProvider>
            <BrowserRouter>
              <AuthProvider>
                <SignupProvider>
                  <AppRoutes />
                </SignupProvider>
              </AuthProvider>
              <Toaster
                closeButton
                className="!z-[9999]"
                toastOptions={{
                  className: "!border-none !z-[9999]",
                  classNames: {
                    actionButton: "!bg-primary",
                    closeButton: "!hover:bg-red-500 !border-accent",
                  },
                }}
                icons={{
                  success: <SuccessIcon />,
                }}
              />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
