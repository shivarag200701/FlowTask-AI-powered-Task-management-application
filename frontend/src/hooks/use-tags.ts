import { createTag, getFilteredTags } from "@/api/tag";
import { tagsQueryKeys } from "@/query-keys";
import type { TagsQuery } from "@/types";
import type { ResourceColorsEnum } from "@shiva200701/todotypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: async (tag: { tagName: string; color: ResourceColorsEnum }) => {
      createTag(tag);
    },
  });
}
