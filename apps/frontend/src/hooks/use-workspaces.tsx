import {
  createWorkspace,
  getWorkspace,
  getWorkspaces,
  inviteWorkspaceCode,
} from "@/api/workspace";
import { workspaceKeys } from "@/query-keys";
import type { InviteResult } from "@/types";
import type { CreateWorkspace } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: getWorkspaces,
    enabled: true,
    staleTime: 60000,
  });
}

export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: workspaceKeys.detail(id ?? ""),
    queryFn: () => getWorkspace(id!),
    enabled: !!id,
    staleTime: 60000,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspace) => createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      toast.success("Workspace created successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("Something went wrong");
    },
  });
}

export function useInviteWorkspaceCode() {
  return useMutation<
    Extract<InviteResult, { success: true }>,
    Extract<InviteResult, { success: false }>,
    string
  >({
    mutationFn: (inviteCode: string) => inviteWorkspaceCode(inviteCode),
  });
}
