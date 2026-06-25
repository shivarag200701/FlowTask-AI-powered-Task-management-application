import {
  acceptEmailInvite,
  checkWorkspaceSlug,
  createWorkspace,
  getWorkspace,
  getWorkspacePreview,
  getWorkspaces,
  inviteWorkspaceCode,
  resetInviteCode,
  sendEmailInvite,
} from "@/api/workspace";
import type { InviteForm } from "@/components/modals/InviteMemberModal";
import { workspaceKeys } from "@/query-keys";
import type { InviteResult } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, isAxiosError, type AxiosResponse } from "axios";
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
    mutationFn: (data: FormData) => createWorkspace(data),
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

export function useInviteCodeReset({
  workspaceId,
  slug,
}: {
  workspaceId: string;
  slug: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetInviteCode({ workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(slug),
      });
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

export function useCheckWorkspaceSlug() {
  return useMutation<
    AxiosResponse,
    AxiosError<{ msg: string }>,
    { slug: string }
  >({
    mutationFn: ({ slug }: { slug: string }) => checkWorkspaceSlug({ slug }),
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

export function useSendEmailInvite() {
  return useMutation({
    mutationFn: ({
      data,
      workspaceId,
    }: {
      data: InviteForm;
      workspaceId: string;
    }) => sendEmailInvite({ data, workspaceId }),
    onSuccess: ({ invited, skipped }) => {
      if (invited.length > 0) {
        toast.success(
          invited.length === 1
            ? `Invite sent to ${invited[0]}`
            : `Invites sent to ${invited.length} people`
        );
      }
      if (skipped && skipped.length > 0) {
        skipped.forEach((email) => {
          toast.warning(`${email} was already invited`);
        });
      }
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

export function useInvitePreview() {
  return useMutation({
    mutationFn: ({ token, email }: { token: string; email: string }) =>
      getWorkspacePreview({ token, email }),
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

export function useAcceptEmailInvite() {
  return useMutation({
    mutationFn: ({ workspaceId }: { workspaceId: string }) =>
      acceptEmailInvite({ workspaceId }),
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
