import { getFilteredTags } from "@/api/tag";
import { tagsQueryKeys } from "@/query-keys";
import type { TagsQuery } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
