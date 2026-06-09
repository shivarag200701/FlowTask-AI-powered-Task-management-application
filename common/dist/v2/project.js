import { boolean, z } from "zod";
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
export const ProjectSearchDocumentSchema = z.object({
    name: z.string(),
    id: z.string(),
    slug: z.string().optional(),
    userId: z.string(),
    personal: boolean(),
});
//# sourceMappingURL=project.js.map