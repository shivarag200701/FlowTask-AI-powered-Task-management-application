import { z } from "zod";
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    personal: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    workspaceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    taskDisplayPreferences: z.ZodOptional<z.ZodObject<{
        viewMode: z.ZodEnum<{
            list: "list";
            board: "board";
            calendar: "calendar";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CreateProjectSectionSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const UpdateProjectSectionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sortKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectSectionSchema = z.infer<typeof UpdateProjectSectionSchema>;
export type CreateProjectSection = z.infer<typeof CreateProjectSectionSchema>;
//# sourceMappingURL=project.d.ts.map