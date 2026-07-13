import z from "zod";
export declare const StartConversationSchema: z.ZodObject<{
    timezone: z.ZodString;
}, z.core.$strip>;
export declare const SendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    timezone: z.ZodString;
}, z.core.$strip>;
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
//# sourceMappingURL=assistant.d.ts.map