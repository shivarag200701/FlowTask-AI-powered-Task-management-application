import type { Project, ProjectWithDateTime } from "@/types";
import api from "@/utils/functions/api";
import type { CreateProject, UpdateProject } from "@shiva200701/todotypes";
import { DateTime } from "luxon";

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

export async function getProject(id: string): Promise<ProjectWithDateTime> {
  try {
    const { project }: { project: Project } = (
      await api.get(`/api/v2/projects/${id}`)
    ).data;
    return {
      ...project,
      todos: project.todos.map((todo) => ({
        ...todo,
        dueDate: todo.dueDate ? DateTime.fromISO(todo.dueDate) : null,
        dueTime: todo.dueTime ? DateTime.fromISO(todo.dueTime) : null,
        children: todo.children?.map((child) => ({
          ...child,
          dueDate: child.dueDate ? DateTime.fromISO(child.dueDate) : null,
          dueTime: child.dueTime ? DateTime.fromISO(child.dueTime) : null,
        })),
      })),
    };
  } catch (error) {
    throw error;
  }
}

export async function updateProject(id: string, data: UpdateProject) {
  try {
    await api.put(`/api/v2/projects/${id}`, { ...data });
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
