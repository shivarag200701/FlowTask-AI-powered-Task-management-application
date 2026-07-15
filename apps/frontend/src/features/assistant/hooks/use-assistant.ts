import {
  startConversation,
  getConversations,
  getConversation,
  deleteConversation,
  sendMessage,
  sendMessageStream,
  type SSEEvent,
} from "@/api/assistant";
import type { AiMessageResponse } from "@shiva200701/todotypes";
import { assistantKeys } from "@/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useAssistantConversations() {
  return useQuery({
    queryKey: assistantKeys.conversations,
    queryFn: () => getConversations(),
    staleTime: 30000,
  });
}

export function useSearchConversations(search: string) {
  return useQuery({
    queryKey: assistantKeys.conversationSearch(search),
    queryFn: () => getConversations({ search, limit: 20 }),
    enabled: search.trim().length > 0,
    staleTime: 10000,
    placeholderData: (prev) => prev,
  });
}

export function useAssistantConversation(id: string | null) {
  return useQuery({
    queryKey: assistantKeys.conversation(id || ""),
    queryFn: () => getConversation(id!),
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.conversations });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.msg || "Failed to start conversation"
        );
        return;
      }
      toast.error("Something went wrong");
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.conversations });
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assistantKeys.conversation(conversationId),
      });
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

export type StreamStage =
  | "idle"
  | "received"
  | "thinking"
  | "streaming"
  | "tool_calling"
  | "complete";

export function useStreamMessage(
  conversationId: string,
  onComplete?: (message: AiMessageResponse) => void
) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamStage, setStreamStage] = useState<StreamStage>("idle");
  const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => abort, [abort]);

  const send = useCallback(
    async (content: string, conversationIdOverride?: string) => {
      const id = conversationIdOverride || conversationId;
      if (!id) return;

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStreamingContent("");
      setStreamStage("idle");
      setActiveToolCall(null);

      try {
        await sendMessageStream(
          id,
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
                setActiveToolCall(null);
                setStreamingContent((prev) => prev + event.token);
                break;
              case "tool_call":
                setStreamStage("tool_calling");
                setActiveToolCall(event.tool);
                break;
              case "tool_result":
                break;
              case "complete":
                setStreamStage("complete");
                setStreamingContent("");
                setIsStreaming(false);
                queryClient.invalidateQueries({
                  queryKey: assistantKeys.conversation(id),
                });
                console.log("message complete", event.message);

                onComplete?.(event.message as AiMessageResponse);
                break;
              case "error":
                setStreamStage("idle");
                setStreamingContent("");
                setIsStreaming(false);
                toast.error("AI response failed");
                break;
            }
          },
          controller.signal
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
    [conversationId, queryClient, onComplete]
  );

  return {
    send,
    abort,
    isStreaming,
    streamingContent,
    streamStage,
    activeToolCall,
  };
}
