import z from "zod";

// Request schemas
export const StartConversationSchema = z.object({
  timezone: z.string(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  timezone: z.string(),
});

// Response types
export interface AiMessageResponse {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface AiConversationResponse {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: AiMessageResponse[];
}

export type StartConversation = z.infer<typeof StartConversationSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
