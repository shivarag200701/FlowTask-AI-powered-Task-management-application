import z from "zod";
// Request schemas
export const StartConversationSchema = z.object({
    timezone: z.string(),
});
export const SendMessageSchema = z.object({
    content: z.string().min(1).max(5000),
    timezone: z.string(),
});
//# sourceMappingURL=assistant.js.map