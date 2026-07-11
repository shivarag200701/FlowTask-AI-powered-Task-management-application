import z from "zod";
export declare const StartSessionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        DAILY_STANDUP: "DAILY_STANDUP";
        FREEFORM: "FREEFORM";
    }>;
    timezone: z.ZodString;
}, z.core.$strip>;
export declare const SendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    timezone: z.ZodString;
}, z.core.$strip>;
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
//# sourceMappingURL=accountability.d.ts.map