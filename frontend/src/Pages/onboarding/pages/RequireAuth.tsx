import { Auth } from "@/Context/AuthContext";
import type { Todo, User } from "@/types";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = Auth();
  const { pathname } = useLocation();

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
    queryFn: async (): Promise<Todo> => {
      const res = await api.get("/v1/todo/");
      return res.data.todos;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 60000,
  });

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
};

export default RequireAuth;
