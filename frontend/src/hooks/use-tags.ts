import { createTag, getFilteredTags, updateTag } from "@/api/tag";
import { tagsQueryKeys } from "@/query-keys";
import type { TagsQuery } from "@/types";
import type { ResourceColorsEnum } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useTags({
  query,
  enabled = true,
}: {
  query: TagsQuery;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: tagsQueryKeys.filtered(query),
    enabled,
    queryFn: () => getFilteredTags({ query }),
  });
}

export function useCreateTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tag: { name: string; color: ResourceColorsEnum }) => {
      await createTag(tag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKeys.all });
      toast.success("Tag added successfully!");
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

export function useUpdateTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tag,
    }: {
      id: string;
      tag: {
        name: string | undefined;
        color: ResourceColorsEnum | undefined;
      };
    }) => {
      await updateTag({ id, tag });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKeys.all });
      toast.success("Successfully updated tag!");
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
