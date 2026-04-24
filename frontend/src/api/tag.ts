import type { TagProps, TagsQuery } from "@/types";
import api from "@/utils/functions/api";
import type { ResourceColorsEnum } from "@shiva200701/todotypes";
import { isAxiosError } from "axios";

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
