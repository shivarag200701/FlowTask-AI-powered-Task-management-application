import { z } from "zod";
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    personal: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    workspaceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
//# sourceMappingURL=project.d.ts.map