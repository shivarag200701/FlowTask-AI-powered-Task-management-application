import z from "zod";
export const CreateWorkspaceSchema = z.object({
    name: z.string().min(1).max(500),
    slug: z.string(),
});
export const JoinWorkspaceSchema = z.object({
    inviteCode: z.string().length(24),
});
export const workspaceRoles = z.enum(["owner", "member"]);
export const EmailInvitesSchema = z.object({
    invites: z
        .array(z.object({
        email: z.email(),
        role: workspaceRoles,
    }))
        .max(3),
});
export const INVITE_ERROR_CODES = {
    INVALID_ERROR_CODE: "INVALID_ERROR_CODE",
    USER_LIMIT_REACHED: "USER_LIMIT_REACHED",
    ALREADY_MEMBER: "ALREADY_MEMBER",
};
//# sourceMappingURL=workspace.js.map