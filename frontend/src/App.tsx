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
          <Route path="/onboarding/completed" element={<OnboardingCompleted />} />
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
            <Route path="/app/search/*" element={<Search />} />
            <Route path="/app/task/:slug" element={<TaskDetail />} />
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
            </BrowserRouter>
          </TooltipProvider>
          <Toaster
            closeButton
            toastOptions={{
              className: "!border-none",
              classNames: {
                actionButton: "!bg-primary",
                closeButton: "!hover:bg-red-500 !border-accent",
              },
            }}
            icons={{
              success: <SuccessIcon />,
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
