import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import { Completed } from "@/pages/onboarding/pages/Completed";
import PublicRoute from "@/routes/PublicRoute";
import AppLayout from "./layouts/AppLayout";
import Today from "./pages/Today";
import Upcoming from "./pages/Upcoming";
import { TooltipProvider } from "@/components/ui/tooltip";
import Tags from "./pages/Tags";
import SuccessIcon from "./components/icons/success-icon";

const queryClient = new QueryClient();

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
                  <Routes>
                    <Route element={<PublicRoute />}>
                      <Route path="/" element={<Landing />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<Signup />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                      <Route path="/onboarding/welcome" element={<Welcome />} />
                      <Route
                        path="/onboarding/user-profile"
                        element={<UserProfile />}
                      />
                      <Route
                        path="/onboarding/completed"
                        element={<Completed />}
                      />
                      <Route element={<AppLayout />}>
                        <Route path="/app/today" element={<Today />} />
                        <Route path="/app/upcoming" element={<Upcoming />} />
                        <Route path="/app/tags" element={<Tags />} />
                      </Route>
                    </Route>
                  </Routes>
                </SignupProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
          <Toaster
            closeButton
            toastOptions={{
              classNames: {
                actionButton: "!bg-primary",
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
