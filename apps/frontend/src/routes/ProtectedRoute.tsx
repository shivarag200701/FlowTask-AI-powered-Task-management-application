import { useLocation, Navigate, Outlet } from "react-router-dom";
import { Auth } from "@/context/AuthContext";
import { SpinnerCustom } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { ONBOARDING_WINDOW_SECONDS } from "@shiva200701/todotypes";
import { getCurrentUser, fetchTodos, getOnboardingProgress } from "@/api";
import {
  authQueryKeys,
  todosQueryKeys,
  onboardingQueryKeys,
  userPreferenceKeys,
} from "@/query-keys";
import { getUserPreference } from "@/api/user";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = Auth();
  const location = useLocation();

  const callbackUrl = encodeURIComponent(location.pathname + location.search);

  //Todo replace with custom hook
  const { isLoading: userLoading, data: user } = useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getCurrentUser,
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  const { isLoading: preferenceLoading } = useQuery({
    queryKey: userPreferenceKeys.preferences,
    queryFn: getUserPreference,
    staleTime: 60000,
    enabled: isAuthenticated,
  });

  // const { isLoading: projectLoading } = useProjects();

  // Fetch todos - this ensures todos are loaded before showing dashboard
  const { isLoading: todosLoading } = useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(),
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 60000,
  });

  //get onboarding progress
  const { data: onboardingStep } = useQuery({
    queryKey: onboardingQueryKeys.progress,
    queryFn: getOnboardingProgress,
    retry: 1,
  });

  // Show loading until auth check, user query, AND todos query are complete
  if (
    isLoading ||
    (isAuthenticated && (userLoading || todosLoading || preferenceLoading))
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="Logo" width={100} height={100} />
        <SpinnerCustom />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return (
      <Navigate
        to={`/signin?callbackUrl=${callbackUrl}`}
        state={{ from: location }}
        replace
      />
    );
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
      return (
        <Navigate to="/onboarding/welcome" state={{ from: location }} replace />
      );
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
    return <Navigate to="/app/today" state={{ from: location }} replace />;
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
    return <Navigate to="/app/today" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
