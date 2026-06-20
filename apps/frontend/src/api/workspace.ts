import type { Workspaces, WorkspaceDetail, InviteResult } from "@/types";
import api from "@/utils/functions/api";
import type { CreateWorkspace } from "@shiva200701/todotypes";
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

export async function createWorkspace(data: CreateWorkspace) {
  try {
    await api.post("/api/v2/workspaces", data);
  } catch (error) {
    throw error;
  }
}

export async function inviteWorkspaceCode(
  inviteCode: string
): Promise<Extract<InviteResult, { success: true }>> {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const res = await api.post("/api/v2/workspaces/invite", {
      inviteCode,
    });
    return { success: true, msg: res.data.msg, workspace: res.data.workspace };
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const { code, workspaceId, workspace } = error.response.data;
      throw { success: false, code, workspaceId, workspace };
    }

    throw { success: false, code: "UNKNOWN", msg: "Something went wrong" };
  }
}
