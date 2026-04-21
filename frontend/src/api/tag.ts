import type { Tag, TagsQuery } from "@/types";
import api from "@/utils/api";

export async function getFilteredTags({ query }: { query: TagsQuery }) {
  const searchParams = new URLSearchParams({ ...query } as Record<
    string,
    any
  >).toString();
  console.log(searchParams);

  const { tags }: { tags: Tag[] } = (
    await api.get(`/api/v2/tag?${searchParams}`)
  ).data;

  return tags;
}
