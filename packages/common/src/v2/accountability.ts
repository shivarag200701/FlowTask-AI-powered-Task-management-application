import z from "zod";

// Request schemas
export const StartSessionSchema = z.object({
  type: z.enum(["DAILY_STANDUP", "FREEFORM"]),
  timezone: z.string(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
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

export interface WeeklyInsightResponse {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  overallCompletionRate: number;
  previousWeekRate: number | null;
  trend: "IMPROVING" | "DECLINING" | "STABLE";
  mostProductiveDay: string | null;
  leastProductiveDay: string | null;
  problematicTags: Record<string, any> | null;
  problematicProjects: Record<string, any> | null;
  summary: string;
  readAt: string | null;
  createdAt: string;
}

export interface AccountabilityStatsResponse {
  streak: number;
  completionRate7d: number;
  completionRate30d: number;
  trend: "IMPROVING" | "DECLINING" | "STABLE";
  totalSessionsThisWeek: number;
  unreadInsights: number;
}

export type StartSession = z.infer<typeof StartSessionSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
