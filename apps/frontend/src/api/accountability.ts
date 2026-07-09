import api from "@/utils/functions/api";
import type {
  AccountabilitySessionResponse,
  AccountabilityStatsResponse,
  WeeklyInsightResponse,
} from "@shiva200701/todotypes";

export async function startSession(params: { type: "DAILY_STANDUP" | "FREEFORM" }) {
  const { data } = await api.post("/api/v2/ai/accountability/sessions", {
    type: params.type,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return data.session as AccountabilitySessionResponse;
}

export async function getSessions(params?: { type?: string; status?: string; limit?: number; offset?: number }) {
  const { data } = await api.get("/api/v2/ai/accountability/sessions", { params });
  return data.sessions as AccountabilitySessionResponse[];
}

export async function getSession(id: string) {
  const { data } = await api.get(`/api/v2/ai/accountability/sessions/${id}`);
  return data.session as AccountabilitySessionResponse;
}

export async function sendMessage(sessionId: string, content: string) {
  const { data } = await api.post(`/api/v2/ai/accountability/sessions/${sessionId}/messages`, {
    content,
  });
  return data as {
    userMessage: { id: string; role: string; content: string; createdAt: string };
    assistantMessage: { id: string; role: string; content: string; createdAt: string };
  };
}

export async function completeSession(sessionId: string) {
  const { data } = await api.patch(`/api/v2/ai/accountability/sessions/${sessionId}`, {
    status: "COMPLETED",
  });
  return data.session;
}

export async function getInsights(params?: { limit?: number; offset?: number }) {
  const { data } = await api.get("/api/v2/ai/accountability/insights", { params });
  return data.insights as WeeklyInsightResponse[];
}

export async function markInsightRead(id: string) {
  const { data } = await api.patch(`/api/v2/ai/accountability/insights/${id}/read`);
  return data.insight as WeeklyInsightResponse;
}

export async function getStats() {
  const { data } = await api.get("/api/v2/ai/accountability/stats");
  return data as AccountabilityStatsResponse;
}

// SSE streaming types
export type SSEEvent =
  | { stage: "received"; userMessage: { id: string; role: string; content: string; createdAt: string } }
  | { stage: "thinking" }
  | { stage: "streaming"; token: string }
  | { stage: "complete"; message: { id: string; role: string; content: string; createdAt: string } }
  | { stage: "error"; error?: string };

export async function sendMessageStream(
  sessionId: string,
  content: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
) {
  const baseURL = import.meta.env.VITE_API_URL || "";
  const response = await fetch(
    `${baseURL}/api/v2/ai/accountability/sessions/${sessionId}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ content }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(trimmed.slice(6)) as SSEEvent;
        onEvent(event);
      } catch {
        // skip malformed lines
      }
    }
  }
}
