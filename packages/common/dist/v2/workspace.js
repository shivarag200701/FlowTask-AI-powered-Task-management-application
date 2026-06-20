import z from "zod";
export const CreateWorkspaceSchema = z.object({
    name: z.string().min(1).max(500),
});
export const JoinWorkspaceSchema = z.object({
    inviteCode: z.string().length(24),
});
export const INVITE_ERROR_CODES = {
    INVALID_ERROR_CODE: "INVALID_ERROR_CODE",
    USER_LIMIT_REACHED: "USER_LIMIT_REACHED",
    ALREADY_MEMBER: "ALREADY_MEMBER",
};
//# sourceMappingURL=workspace.js.map