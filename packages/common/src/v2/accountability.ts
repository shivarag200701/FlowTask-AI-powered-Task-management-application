import z from "zod";

// Request schemas
export const StartSessionSchema = z.object({
  type: z.enum(["DAILY_STANDUP", "FREEFORM"]),
  timezone: z.string(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  timezone: z.string(),
});

// Response types
export interface AccountabilityMessageResponse {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface AccountabilitySessionResponse {
  id: string;
  userId: string;
  type: "DAILY_STANDUP" | "FREEFORM";
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  taskSnapshot: Record<string, any> | null;
  startedAt: string;
  completedAt: string | null;
  messages: AccountabilityMessageResponse[];
}

export type StartSession = z.infer<typeof StartSessionSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
