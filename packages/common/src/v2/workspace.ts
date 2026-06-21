import z from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(500),
  slug: z.string(),
});

export const JoinWorkspaceSchema = z.object({
  inviteCode: z.string().length(24),
});

export const INVITE_ERROR_CODES = {
  INVALID_ERROR_CODE: "INVALID_ERROR_CODE",
  USER_LIMIT_REACHED: "USER_LIMIT_REACHED",
  ALREADY_MEMBER: "ALREADY_MEMBER",
} as const;

export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type JoinWorkspaceSchema = z.infer<typeof JoinWorkspaceSchema>;
export type InviteErrorCode =
  (typeof INVITE_ERROR_CODES)[keyof typeof INVITE_ERROR_CODES];
