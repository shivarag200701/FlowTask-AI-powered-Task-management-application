import { z } from "zod";

export const RESOURCE_COLORS_DATA = [
  {
    color: "red",
    tagVariants: "bg-red-100 text-red-600",
  },
  {
    color: "yellow",
    tagVariants: "bg-yellow-100 text-yellow-600",
  },
  {
    color: "green",
    tagVariants: "bg-green-100 text-green-600",
  },
  {
    color: "blue",
    tagVariants: "bg-blue-100 text-blue-600",
  },
  {
    color: "purple",
    tagVariants: "bg-purple-100 text-purple-600",
  },
  {
    color: "brown",
    tagVariants: "bg-brown-100 text-brown-600",
  },
  {
    color: "gray",
    tagVariants: "bg-gray-100 text-gray-600",
  },
] as const;

export const RESOURCE_COLORS = RESOURCE_COLORS_DATA.map((c) => c.color);

export const TagColorSchema = z.enum(RESOURCE_COLORS);

export type ResourceColorsEnum = z.infer<typeof TagColorSchema>;

export const CreateTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: TagColorSchema.optional(),
});

export const UpdateTagSchema = CreateTagSchema.partial();

//todo add sortOrder and orderBy
export const GetTagsQuerySchema = z.object({
  search: z.string().optional().meta({
    id: "search_filter",
    title: "Search filter",
    description: "The search term to filter the tags by.",
  }),
  ids: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : v.split(",")))
    .optional()
    .meta({
      id: "tag_ids_filter",
      title: "tag ids",
      description: "ids of tags associated with the todo",
    }),
});

export const TagBulkDeleteSchema = z.object({
  tagIds: z.string(),
});

export const TagSearchDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  userId: z.string(),
});

export type TagSearchDocument = z.infer<typeof TagSearchDocumentSchema>;
