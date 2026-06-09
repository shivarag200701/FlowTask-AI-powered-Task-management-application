import { getCurrentUser } from "@/api";
import { Auth } from "@/context/AuthContext";
import { authQueryKeys } from "@/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useUserProfile() {
  const { isAuthenticated } = Auth();

  return useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });
}
