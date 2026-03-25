import { Auth } from "@/Context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { Spinner } from "./ui/spinner";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = Auth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src="/favicon.png" alt="Logo" width={100} height={100} />
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("here in public route");

    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
