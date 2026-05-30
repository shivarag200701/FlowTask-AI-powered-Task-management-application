import { z } from "zod";
import { taskViewModes } from "../v1";
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
//# sourceMappingURL=project.js.map