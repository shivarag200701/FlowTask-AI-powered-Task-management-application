import { useLocation, Navigate, Outlet } from "react-router-dom";
import { Auth } from "../Context/AuthContext";
import { Spinner } from "./ui/spinner";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import type { Todo, TodoWithCompleteAtDateTime, User } from "@/types";
import {
  ONBOARDING_WINDOW_SECONDS,
  type OnboardingStep,
} from "@shiva200701/todotypes";
import { DateTime } from "luxon";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = Auth();
  const location = useLocation();

  // Fetch user data - this ensures user profile is loaded before showing dashboard
  const { isLoading: userLoading, data: user } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User> => {
      const res = await api.get("/v1/user/profile");
      return res.data.user;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Fetch todos - this ensures todos are loaded before showing dashboard
  const { isLoading: todosLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<TodoWithCompleteAtDateTime[]> => {
      const { todos }: { todos: Todo[] } = (await api.get("/v1/todo/")).data;

      return todos.map((todo) => ({
        ...todo,
        completeAt: DateTime.fromISO(todo.completeAt ?? ""),
      }));
    },
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 60000,
  });

  //get onboarding progress
  const { data: onboardingStep } = useQuery({
    queryKey: ["onboardingProgress"],
    queryFn: async (): Promise<OnboardingStep> => {
      const res = await api.get("/v1/user/onboarding/progess");
      return res.data.step;
    },
    retry: 1,
  });

  // Show loading until auth check, user query, AND todos query are complete
  if (isLoading || (isAuthenticated && (userLoading || todosLoading))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="Logo" width={100} height={100} />
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  // user is authenticated and redis entry is present and they havent completed the onboarding
  else if (
    isAuthenticated &&
    new Date(user?.createdAt ?? "").getTime() >
      Date.now() - ONBOARDING_WINDOW_SECONDS * 1000 &&
    onboardingStep !== "completed" &&
    !location.pathname.startsWith("/onboarding")
  ) {
    if (!onboardingStep) {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return (
      <Navigate
        to={`/onboarding/${onboardingStep}`}
        state={{ from: location }}
        replace
      />
    );
  }
  //user authenticated and they have completed the onboarding
  else if (
    isAuthenticated &&
    onboardingStep === "completed" &&
    location.pathname.startsWith("/onboarding") &&
    location.pathname !== "/onboarding/completed"
  ) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  // user is authenticated and they try to go to onboarding given that either the onboarding is completed or the key is expried, then redirect to dashboard
  else if (
    isAuthenticated &&
    location.pathname.startsWith("/onboarding") &&
    (onboardingStep === "completed" ||
      new Date(user?.createdAt ?? "").getTime() <=
        Date.now() - ONBOARDING_WINDOW_SECONDS * 1000) &&
    location.pathname !== "/onboarding/completed"
  ) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
