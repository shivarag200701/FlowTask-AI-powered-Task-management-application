import { z } from "zod";
export const CreateProjectSchema = z.object({
    name: z.string().min(1),
    personal: z.boolean().default(false).optional(),
    workspaceId: z.string().optional(),
});
//# sourceMappingURL=project.js.map