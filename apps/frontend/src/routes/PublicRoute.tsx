import { Auth } from "@/context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = Auth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/today" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
