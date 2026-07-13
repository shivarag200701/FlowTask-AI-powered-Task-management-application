import api from "@/utils/functions/api";
import type { AiConversationResponse } from "@shiva200701/todotypes";

export async function startConversation() {
  const { data } = await api.post("/api/v2/ai/assistant/conversations", {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return data.conversation as AiConversationResponse;
}

export async function getConversations(params?: {
  limit?: number;
  offset?: number;
}) {
  const { data } = await api.get("/api/v2/ai/assistant/conversations", {
    params,
  });
  return data.conversations as AiConversationResponse[];
}

export async function getConversation(id: string) {
  const { data } = await api.get(`/api/v2/ai/assistant/conversations/${id}`);
  return data.conversation as AiConversationResponse;
}

export async function deleteConversation(id: string) {
  const { data } = await api.delete(`/api/v2/ai/assistant/conversations/${id}`);
  return data;
}

export async function sendMessage(conversationId: string, content: string) {
  const { data } = await api.post(
    `/api/v2/ai/assistant/conversations/${conversationId}/messages`,
    {
      content,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  );
  return data as {
    userMessage: {
      id: string;
      role: string;
      content: string;
      createdAt: string;
    };
    assistantMessage: {
      id: string;
      role: string;
      content: string;
      createdAt: string;
    };
  };
}

// SSE streaming types
export type SSEEvent =
  | {
      stage: "received";
      userMessage: {
        id: string;
        role: string;
        content: string;
        createdAt: string;
      };
    }
  | { stage: "thinking" }
  | { stage: "streaming"; token: string }
  | { stage: "tool_call"; tool: string; args: Record<string, any> }
  | { stage: "tool_result"; tool: string; result: any }
  | {
      stage: "complete";
      message: { id: string; role: string; content: string; createdAt: string };
    }
  | { stage: "error"; error?: string };

export async function sendMessageStream(
  conversationId: string,
  content: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
) {
  const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const response = await fetch(
    `${baseURL}/api/v2/ai/assistant/conversations/${conversationId}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        content,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      signal,
    }
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
