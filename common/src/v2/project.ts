import { z } from "zod";
import { taskViewModes } from "../v1.js";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  personal: z.boolean().default(false).optional(),
  workspaceId: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  taskDisplayPreferences: z
    .object({
      viewMode: taskViewModes,
    })
    .optional(),
});

export const CreateProjectSectionSchema = z.object({
  name: z.string().min(1),
});

export const UpdateProjectSectionSchema = z.object({
  name: z.string().min(1).optional(),
  projectId: z.string().nullish(),
  prevIndex: z.string().nullish(),
  nextIndex: z.string().nullish(),
});

export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

export type CreateProject = z.infer<typeof CreateProjectSchema>;

export type UpdateProjectSectionSchema = z.infer<
  typeof UpdateProjectSectionSchema
>;

export type CreateProjectSection = z.infer<typeof CreateProjectSectionSchema>;
