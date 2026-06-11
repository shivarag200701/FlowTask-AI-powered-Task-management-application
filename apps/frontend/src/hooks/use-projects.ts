import {
  createProject,
  createProjectSection,
  deleteProject,
  deleteProjectSection,
  getInbox,
  getPersonalProject,
  getProject,
  getProjects,
  getProjectSections,
  updateProject,
  updateProjectSection,
} from "@/api/project";
import { projectKeys } from "@/query-keys";
import type {
  CreateProject,
  UpdateProject,
  UpdateProjectSectionSchema,
} from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useCreateProject({
  personal,
  name,
  workspaceId,
}: CreateProject) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => createProject({ name, personal, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project created successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}

export function usePersonalProject(search: string) {
  return useQuery({
    queryKey: projectKeys.personal(search),
    queryFn: () => getPersonalProject({ query: { search } }),
    enabled: true,
    staleTime: 60000,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: projectKeys.project(id ?? ""),
    queryFn: () => getProject(id!),
    enabled: !!id,
    staleTime: 60000,
    select: (data) => ({
      ...data,
      todos: data.todos.filter((t) => !t.completed),
    }),
  });
}

export function useSection({
  projectId,
  sectionId,
}: {
  projectId: string;
  sectionId: string;
}) {
  return useQuery({
    queryKey: projectKeys.section({ projectId, sectionId }),
  });
}

export function useInbox() {
  return useQuery({
    queryKey: projectKeys.inbox,
    queryFn: () => getInbox(),
    staleTime: 60000,
    select: (data) => ({
      ...data,
      todos: data.todos.filter((t) => !t.completed),
    }),
  });
}

export function useNoSectionProjectTodos(id: string | null) {
  return useQuery({
    queryKey: projectKeys.project(id ?? ""),
    queryFn: () => getProject(id!),
    enabled: !!id,
    staleTime: 60000,
    select: (data) => ({
      ...data,
      todos: data.todos.filter(
        (t) => !t.completed && t.projectSectionId === null
      ),
    }),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => getProjects(),
    enabled: true,
    staleTime: 60000,
  });
}

export function useDeleteProject(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error("projectId is required");
      return deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });

      toast.success("Project deleted successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}

export function useProjectSections(id: string | null) {
  return useQuery({
    queryKey: projectKeys.sections(id ?? ""),
    queryFn: () => getProjectSections(id!),
    enabled: !!id,
    staleTime: 60000,
    select: (data) =>
      data
        .sort((a, b) => {
          if (a.sortKey < b.sortKey) return -1;
          if (a.sortKey > b.sortKey) return 1;
          return 0;
        })
        .map((section) => ({
          ...section,
          todos: section.todos.sort((a, b) => {
            if (a.sortKey < b.sortKey) return -1;
            if (a.sortKey > b.sortKey) return 1;
            return 0;
          }),
        })),
  });
}

export function useCreateProjectSection({
  projectId,
}: {
  projectId: string | null;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }: { name: string }) => {
      if (!projectId) throw new Error("projectId is required");
      return createProjectSection({ projectId, name });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.sections(projectId),
        });
      }
      toast.success("Section created successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}

export function useUpdateProjectSection({
  projectId,
}: {
  projectId: string | null;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      sectionId,
    }: {
      data: UpdateProjectSectionSchema;
      sectionId: string;
    }) => {
      if (!projectId) throw new Error("projectId is required");
      return updateProjectSection({ projectId, sectionId, data });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.sections(projectId),
        });
      }
      toast.success("Section updated successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}

export function useDeleteProjectSection({
  projectId,
  sectionId,
}: {
  projectId: string | null;
  sectionId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!projectId) throw new Error("projectId is required");
      return deleteProjectSection({ projectId, sectionId });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.sections(projectId),
        });
      }
      toast.success("Section deleted successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}

export function useUpdateProject(id: string | null, isInbox = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProject }) =>
      updateProject(id, data),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: projectKeys.project(id) });
        queryClient.invalidateQueries({ queryKey: projectKeys.personal("") });
        if (isInbox) {
          queryClient.invalidateQueries({ queryKey: projectKeys.inbox });
        }
      }
      toast.success("Project updated successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}
