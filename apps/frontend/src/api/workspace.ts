import type { InviteForm } from "@/components/modals/InviteMemberModal";
import type {
  Workspaces,
  WorkspaceDetail,
  InviteResult,
  InvitePreview,
} from "@/types";
import api from "@/utils/functions/api";
import { isAxiosError } from "axios";

export async function getWorkspaces() {
  try {
    const { workspaces }: { workspaces: Workspaces } = (
      await api.get("/api/v2/workspaces")
    ).data;
    return workspaces;
  } catch (error) {
    throw error;
  }
}

export async function getWorkspace(id: string): Promise<WorkspaceDetail> {
  try {
    const { workspace }: { workspace: WorkspaceDetail } = (
      await api.get(`/api/v2/workspaces/${id}`)
    ).data;
    return workspace;
  } catch (error) {
    throw error;
  }
}

export async function createWorkspace(formData: globalThis.FormData) {
  try {
    await api.post("/api/v2/workspaces", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw error;
  }
}

export async function inviteWorkspaceCode(
  inviteCode: string
): Promise<Extract<InviteResult, { success: true }>> {
  try {
    const res = await api.post("/api/v2/workspaces/invite/code/accept", {
      inviteCode,
    });
    return { success: true, msg: res.data.msg, slug: res.data.workspaceSlug };
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const { code, workspaceSlug } = error.response.data;
      throw { success: false, code, slug: workspaceSlug };
    }

    throw { success: false, code: "UNKNOWN", msg: "Something went wrong" };
  }
}

export async function resetInviteCode({
  workspaceId,
}: {
  workspaceId: string;
}) {
  await api.post(`/api/v2/workspaces/${workspaceId}/invite/code/reset`);
}

export async function checkWorkspaceSlug({ slug }: { slug: string }) {
  const response = await api.get(
    `/api/v2/workspaces/check-slug?slug=${encodeURIComponent(slug)}`
  );
  return response;
}

export async function sendEmailInvite({
  data,
  workspaceId,
}: {
  data: InviteForm;
  workspaceId: string;
}): Promise<{ invited: string[]; skipped: string[] }> {
  try {
    const response = (
      await api.post(
        `/api/v2/workspaces/${workspaceId}/invite/email/send`,
        data
      )
    ).data;

    return response;
  } catch (error) {
    throw error;
  }
}

export async function getWorkspacePreview({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  try {
    const response = (
      await api.get<InvitePreview>("/api/v2/workspaces/invite/email/preview", {
        params: { token, email },
      })
    ).data;
    return response;
  } catch (error) {
    throw error;
  }
}
