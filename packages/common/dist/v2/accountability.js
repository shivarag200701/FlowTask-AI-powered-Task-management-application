import z from "zod";
// Request schemas
export const StartSessionSchema = z.object({
    type: z.enum(["DAILY_STANDUP", "FREEFORM"]),
    timezone: z.string(),
});
export const SendMessageSchema = z.object({
    content: z.string().min(1).max(5000),
});
//# sourceMappingURL=accountability.js.map