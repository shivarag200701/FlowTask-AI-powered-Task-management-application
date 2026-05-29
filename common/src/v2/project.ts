import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  personal: z.boolean().default(false).optional(),
  workSpaceId: z.string().optional(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
