import {
  startSession,
  getSessions,
  getSession,
  sendMessage,
  sendMessageStream,
  completeSession,
  getInsights,
  markInsightRead,
  getStats,
  type SSEEvent,
} from "@/api/accountability";
import type { AccountabilityMessageResponse } from "@shiva200701/todotypes";
import { accountabilityKeys } from "@/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useAccountabilityStats() {
  return useQuery({
    queryKey: accountabilityKeys.stats,
    queryFn: getStats,
    staleTime: 60000,
  });
}

export function useAccountabilitySessions(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: [...accountabilityKeys.sessions, params],
    queryFn: () => getSessions(params),
    staleTime: 30000,
  });
}

export function useAccountabilitySession(id: string | null) {
  return useQuery({
    queryKey: accountabilityKeys.session(id || ""),
    queryFn: () => getSession(id!),
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: accountabilityKeys.insights,
    queryFn: () => getInsights(),
    staleTime: 60000,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.sessions });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Failed to start session");
        return;
      }
      toast.error("Something went wrong");
    },
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.session(sessionId) });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Failed to send message");
        return;
      }
      toast.error("Something went wrong");
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.sessions });
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.stats });
      toast.success("Session completed");
    },
    onError: () => {
      toast.error("Failed to complete session");
    },
  });
}

export type StreamStage = "idle" | "received" | "thinking" | "streaming" | "complete";

export function useStreamMessage(
  sessionId: string,
  onComplete?: (message: AccountabilityMessageResponse) => void,
) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamStage, setStreamStage] = useState<StreamStage>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => abort, [abort]);

  const send = useCallback(
    async (content: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStreamingContent("");
      setStreamStage("idle");

      try {
        await sendMessageStream(
          sessionId,
          content,
          (event: SSEEvent) => {
            switch (event.stage) {
              case "received":
                setStreamStage("received");
                break;
              case "thinking":
                setStreamStage("thinking");
                break;
              case "streaming":
                setStreamStage("streaming");
                setStreamingContent((prev) => prev + event.token);
                break;
              case "complete":
                setStreamStage("complete");
                setStreamingContent("");
                setIsStreaming(false);
                queryClient.invalidateQueries({
                  queryKey: accountabilityKeys.session(sessionId),
                });
                onComplete?.(event.message as AccountabilityMessageResponse);
                break;
              case "error":
                setStreamStage("idle");
                setStreamingContent("");
                setIsStreaming(false);
                toast.error("AI response failed");
                break;
            }
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to send message");
        }
        setStreamStage("idle");
        setStreamingContent("");
        setIsStreaming(false);
      }
    },
    [sessionId, queryClient, onComplete],
  );

  return { send, abort, isStreaming, streamingContent, streamStage };
}

export function useMarkInsightRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInsightRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.insights });
      queryClient.invalidateQueries({ queryKey: accountabilityKeys.stats });
    },
  });
}
