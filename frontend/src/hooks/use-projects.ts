import { createProject, getPersonalProject, getProject } from "@/api/project";
import { projectKeys } from "@/query-keys";
import type { CreateProject } from "@shiva200701/todotypes";
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
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.project(id),
    queryFn: () => getProject(id),
    enabled: true,
  });
}
