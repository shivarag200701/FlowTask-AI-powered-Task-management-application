import { useLocation, Navigate, Outlet } from "react-router-dom";
import { Auth } from "@/context/AuthContext";
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
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

type RouteState =
  | "unauthenticated"
  | "needs-onboarding"
  | "onboarding-expired"
  | "ready";

function deriveRouteState(
  isAuthenticated: boolean,
  user: { createdAt?: string | null } | undefined,
  onboardingStep: string | undefined,
  pathname: string
): RouteState {
  if (!isAuthenticated) return "unauthenticated";

  const onOnboardingPage = pathname.startsWith("/onboarding");
  const isWithinWindow =
    !!user?.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() <
      ONBOARDING_WINDOW_SECONDS * 1000;

  // onboarding redis entry exisits and oboarding is not yet completed
  if (
    isWithinWindow &&
    onboardingStep !== undefined &&
    onboardingStep !== "completed" &&
    !onOnboardingPage
  ) {
    return "needs-onboarding";
  }

  // Kick user off onboarding pages only if window expired or no entry exists.
  // If step is "completed", let them through to /onboarding/completed.
  if (onOnboardingPage && !isWithinWindow) {
    return "onboarding-expired";
  }

  if (
    onOnboardingPage &&
    onboardingStep === undefined &&
    pathname !== "/onboarding/completed"
  ) {
    return "onboarding-expired";
  }

  return "ready";
}

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = Auth();
  const location = useLocation();

  const callbackUrl = encodeURIComponent(location.pathname + location.search);

  const { isLoading: userLoading, data: user } = useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });

  const { isLoading: preferenceLoading } = useQuery({
    queryKey: userPreferenceKeys.preferences,
    queryFn: getUserPreference,
    staleTime: 60000,
    enabled: isAuthenticated,
  });

  const { isLoading: todosLoading } = useQuery({
    queryKey: todosQueryKeys.all,
    queryFn: () => fetchTodos(),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const { data: onboardingStep, isLoading: onboardingLoading } = useQuery({
    queryKey: onboardingQueryKeys.progress,
    queryFn: getOnboardingProgress,
    retry: 1,
    enabled: isAuthenticated,
  });

  if (
    isLoading ||
    (isAuthenticated &&
      (userLoading || todosLoading || preferenceLoading || onboardingLoading))
  ) {
    return <AppLoadingScreen />;
  }

  const routeState = deriveRouteState(
    isAuthenticated,
    user,
    onboardingStep,
    location.pathname
  );

  switch (routeState) {
    case "unauthenticated":
      return (
        <Navigate
          to={`/signin?callbackUrl=${callbackUrl}`}
          state={{ from: location }}
          replace
        />
      );

    case "needs-onboarding":
      return (
        <Navigate
          to={`/onboarding/${onboardingStep || "welcome"}`}
          state={{ from: location }}
          replace
        />
      );

    case "onboarding-expired":
      return <Navigate to="/app/today" state={{ from: location }} replace />;

    case "ready":
      return <Outlet />;
  }
};

export default ProtectedRoute;
