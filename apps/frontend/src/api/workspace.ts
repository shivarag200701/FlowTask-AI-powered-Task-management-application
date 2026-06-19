import type { Workspaces, WorkspaceDetail } from "@/types";
import api from "@/utils/functions/api";
import type { CreateWorkspace } from "@shiva200701/todotypes";

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
