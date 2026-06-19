import z from "zod";
export declare const CreateWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
//# sourceMappingURL=workspace.d.ts.map