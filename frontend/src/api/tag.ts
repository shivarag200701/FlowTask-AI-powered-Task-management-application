import type { TagProps, TagsQuery } from "@/types";
import api from "@/utils/functions/api";
import type { ResourceColorsEnum } from "@shiva200701/todotypes";

export async function getFilteredTags({ query }: { query: TagsQuery }) {
  const searchParams = new URLSearchParams({ ...query } as Record<
    string,
    any
  >).toString();
  const { tags }: { tags: TagProps[] } = (
    await api.get(`/api/v2/tag?${searchParams}`)
  ).data;

  return tags;
}

export async function createTag(tag: {
  name: string;
  color: ResourceColorsEnum;
}) {
  try {
    await api.post("/api/v2/tag", tag);
  } catch (error) {
    throw error;
  }
}

export async function updateTag({
  id,
  tag,
}: {
  id: string;
  tag: {
    name: string | undefined;
    color: ResourceColorsEnum | undefined;
  };
}) {
  try {
    await api.patch(`/api/v2/tag/${id}`, tag);
  } catch (error) {
    throw error;
  }
}

export async function getTagCount() {
  try {
    const { count } = (await api.get("/api/v2/tag/count")).data;
    return count;
  } catch (error) {
    throw error;
  }
}
