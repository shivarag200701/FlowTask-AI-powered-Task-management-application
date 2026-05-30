import type { Project } from "@/types";
import api from "@/utils/functions/api";
import type { CreateProject } from "@shiva200701/todotypes";

export async function createProject({
  personal,
  name,
  workspaceId,
}: CreateProject) {
  try {
    await api.post("/api/v2/projects", {
      personal,
      name,
      workspaceId,
    });
  } catch (error) {
    throw error;
  }
}

export async function getProject(id: string) {
  try {
    const { project }: { project: Project } = (
      await api.get(`/api/v2/projects/${id}`)
    ).data;
    return project;
  } catch (error) {
    throw error;
  }
}

export async function getPersonalProject({
  query,
}: {
  query: { search: string };
}) {
  const searchParams = new URLSearchParams({ ...query } as Record<
    string,
    any
  >).toString();
  try {
    const { personalProjects } = (
      await api.get(`/api/v2/projects/personal?${searchParams}`)
    ).data;
    return personalProjects;
  } catch (error) {
    throw error;
  }
}
