import z from "zod";
export declare const CreateWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
}, z.core.$strip>;
export declare const JoinWorkspaceSchema: z.ZodObject<{
    inviteCode: z.ZodString;
}, z.core.$strip>;
export declare const workspaceRoles: z.ZodEnum<{
    owner: "owner";
    member: "member";
}>;
export declare const EmailInvitesSchema: z.ZodObject<{
    invites: z.ZodArray<z.ZodObject<{
        email: z.ZodEmail;
        role: z.ZodEnum<{
            owner: "owner";
            member: "member";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const PatchWorkspaceMemberSchema: z.ZodObject<{
    role: z.ZodEnum<{
        owner: "owner";
        member: "member";
    }>;
}, z.core.$strip>;
export declare const INVITE_ERROR_CODES: {
    readonly INVALID_ERROR_CODE: "INVALID_ERROR_CODE";
    readonly USER_LIMIT_REACHED: "USER_LIMIT_REACHED";
    readonly ALREADY_MEMBER: "ALREADY_MEMBER";
};
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type JoinWorkspaceSchema = z.infer<typeof JoinWorkspaceSchema>;
export type WorkspaceRoles = z.infer<typeof workspaceRoles>;
export type InviteErrorCode = (typeof INVITE_ERROR_CODES)[keyof typeof INVITE_ERROR_CODES];
//# sourceMappingURL=workspace.d.ts.map