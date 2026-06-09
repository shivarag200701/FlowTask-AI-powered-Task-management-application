import { z } from "zod";
export declare const CreateProjectSchema: any;
export declare const UpdateProjectSchema: any;
export declare const CreateProjectSectionSchema: any;
export declare const UpdateProjectSectionSchema: any;
export declare const ProjectSearchDocumentSchema: any;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectSectionSchema = z.infer<typeof UpdateProjectSectionSchema>;
export type CreateProjectSection = z.infer<typeof CreateProjectSectionSchema>;
export type ProjectSearchDocument = z.infer<typeof ProjectSearchDocumentSchema>;
//# sourceMappingURL=project.d.ts.map