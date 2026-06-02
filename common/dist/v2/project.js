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
    sortKey: z.string().nullish(),
    projectId: z.string().nullish(),
});
//# sourceMappingURL=project.js.map