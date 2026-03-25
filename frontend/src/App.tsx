import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/SignIn";
import Signup from "./Pages/Signup";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { SignupProvider } from "./Context/SingupContext";
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/Landing";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

import Welcome from "./Pages/onboarding/pages/Welcome";
import UserProfile from "./Pages/onboarding/pages/UserProfile";
import { Completed } from "./Pages/onboarding/pages/Completed";
import PublicRoute from "./Components/PublicRoute";

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
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Route>
                </Routes>
              </SignupProvider>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
