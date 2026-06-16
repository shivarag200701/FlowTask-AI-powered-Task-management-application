import z from "zod";
export const AiParseTaskSchema = z.object({
    text: z.string().min(10),
    timezone: z.string(),
});
//# sourceMappingURL=ai.js.map